const pool = require('../config/db');
const paginate = require('../utils/paginate');

const getBadgeLevel = (points) => {
  if (points >= 200) return 'Gold';
  if (points >= 100) return 'Silver';
  if (points >= 30) return 'Bronze';
  return 'Member';
};

const createSession = async (req, res) => {
  const { session_type, topic, skill_id } = req.body;

  if (!session_type || !topic) {
    return res.status(400).json({ message: 'session_type and topic are required.' });
  }

  if (session_type !== 'one-on-one' && session_type !== 'group') {
    return res.status(400).json({ message: 'session_type must be one-on-one or group.' });
  }

  const hasSkillId = Object.prototype.hasOwnProperty.call(req.body, 'skill_id') && skill_id !== null;

  try {
    if (hasSkillId) {
      const skillCheck = await pool.query('SELECT 1 FROM skills WHERE skill_id = $1', [skill_id]);
      if (skillCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Skill not found.' });
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const sessionResult = await client.query(
        `
          INSERT INTO sessions (creator_id, session_type, skill_id, topic)
          VALUES ($1, $2, $3, $4)
          RETURNING session_id, creator_id, session_type, skill_id, topic, status, created_at
        `,
        [req.user.user_id, session_type, hasSkillId ? skill_id : null, topic]
      );

      await client.query(
        `
          INSERT INTO session_participants (session_id, user_id, role)
          VALUES ($1, $2, 'creator')
        `,
        [sessionResult.rows[0].session_id, req.user.user_id]
      );

      await client.query('COMMIT');

      return res.status(201).json({
        message: 'Session created successfully.',
        session: sessionResult.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      return res.status(500).json({ message: 'Server error.' });
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getSessions = async (req, res) => {
  const { status, session_type, keyword } = req.query;
  const { page, limit, offset } = paginate(req.query);
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`s.status = $${values.length}`);
  }

  if (session_type) {
    values.push(session_type);
    conditions.push(`s.session_type = $${values.length}`);
  }

  if (keyword) {
    values.push(`%${keyword}%`);
    conditions.push(`s.topic ILIKE $${values.length}`);
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = ` WHERE ${conditions.join(' AND ')}`;
  }

  const listQuery = `
    SELECT
      s.*,
      (
        SELECT COUNT(*)::int
        FROM session_participants sp
        WHERE sp.session_id = s.session_id
      ) AS participant_count
    FROM sessions s
    ${whereClause}
    ORDER BY s.created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM sessions s
    ${whereClause}
  `;

  try {
    const [result, countResult] = await Promise.all([
      pool.query(listQuery, [...values, limit, offset]),
      pool.query(countQuery, values),
    ]);

    const total = countResult.rows[0].total;

    return res.status(200).json({
      sessions: result.rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getSessionById = async (req, res) => {
  const { session_id } = req.params;

  try {
    const sessionResult = await pool.query('SELECT * FROM sessions WHERE session_id = $1', [session_id]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (req.user.role !== 'admin') {
      const membershipResult = await pool.query(
        'SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2',
        [session_id, req.user.user_id]
      );
      if (membershipResult.rows.length === 0) {
        return res.status(403).json({ message: 'You are not a participant of this session.' });
      }
    }

    const participantsResult = await pool.query(
      `
        SELECT
          sp.user_id,
          u.name,
          u.department,
          u.role,
          sp.role AS participant_role,
          sp.joined_at
        FROM session_participants sp
        JOIN users u ON u.user_id = sp.user_id
        WHERE sp.session_id = $1
        ORDER BY sp.joined_at ASC
      `,
      [session_id]
    );

    return res.status(200).json({
      session: sessionResult.rows[0],
      participants: participantsResult.rows,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const joinSession = async (req, res) => {
  const { session_id } = req.params;
  const userId = req.user.user_id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sessionResult = await client.query('SELECT * FROM sessions WHERE session_id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Session not found.' });
    }

    const session = sessionResult.rows[0];
    if (session.status === 'closed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Session is already closed.' });
    }

    if (session.session_type === 'one-on-one') {
      const countResult = await client.query(
        'SELECT COUNT(*)::int AS participant_count FROM session_participants WHERE session_id = $1',
        [session_id]
      );
      if (countResult.rows[0].participant_count >= 2) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'One-on-one session is already full.' });
      }
    }

    const existingParticipant = await client.query(
      'SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [session_id, userId]
    );
    if (existingParticipant.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'You have already joined this session.' });
    }

    const participantResult = await client.query(
      `
        INSERT INTO session_participants (session_id, user_id, role)
        VALUES ($1, $2, 'participant')
        RETURNING participant_id, session_id, user_id, role, joined_at
      `,
      [session_id, userId]
    );

    if (session.status === 'open') {
      await client.query(`UPDATE sessions SET status = 'ongoing' WHERE session_id = $1`, [session_id]);
    }

    const pointsResult = await client.query(
      `
        UPDATE users
        SET contribution_points = contribution_points + 5
        WHERE user_id = $1
        RETURNING contribution_points
      `,
      [userId]
    );

    const points = pointsResult.rows[0].contribution_points;
    const badgeLevel = getBadgeLevel(points);
    await client.query('UPDATE users SET badge_level = $1 WHERE user_id = $2', [badgeLevel, userId]);

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Joined session successfully.',
      participant: participantResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

const leaveSession = async (req, res) => {
  const { session_id } = req.params;
  const userId = req.user.user_id;

  try {
    const sessionResult = await pool.query('SELECT * FROM sessions WHERE session_id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (sessionResult.rows[0].status === 'closed') {
      return res.status(400).json({ message: 'Session is already closed.' });
    }

    const participantResult = await pool.query(
      'SELECT * FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [session_id, userId]
    );

    if (participantResult.rows.length === 0) {
      return res.status(404).json({ message: 'You are not a participant of this session.' });
    }

    if (participantResult.rows[0].role === 'creator') {
      return res.status(403).json({ message: 'Creator cannot leave. Use end session instead.' });
    }

    await pool.query('DELETE FROM session_participants WHERE session_id = $1 AND user_id = $2', [
      session_id,
      userId,
    ]);

    return res.status(200).json({
      message: 'Left session successfully.',
      session_id: parseInt(req.params.session_id)
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const endSession = async (req, res) => {
  const { session_id } = req.params;
  const userId = req.user.user_id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sessionResult = await client.query('SELECT * FROM sessions WHERE session_id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Session not found.' });
    }

    const session = sessionResult.rows[0];

    if (session.status === 'closed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Session is already closed.' });
    }

    if (session.creator_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Only the session creator can end the session.' });
    }

    await client.query(`UPDATE sessions SET status = 'closed', ended_at = NOW() WHERE session_id = $1`, [
      session_id,
    ]);

    const pointsResult = await client.query(
      `
        UPDATE users
        SET contribution_points = contribution_points + 10
        WHERE user_id = $1
        RETURNING contribution_points
      `,
      [userId]
    );

    const points = pointsResult.rows[0].contribution_points;
    const badgeLevel = getBadgeLevel(points);
    await client.query('UPDATE users SET badge_level = $1 WHERE user_id = $2', [badgeLevel, userId]);

    await client.query('COMMIT');

    return res.status(200).json({ message: 'Session ended successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

const deleteSession = async (req, res) => {
  const { session_id } = req.params;

  try {
    const sessionResult = await pool.query('SELECT * FROM sessions WHERE session_id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const session = sessionResult.rows[0];
    if (session.creator_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    if (session.status !== 'closed') {
      return res.status(400).json({ message: 'Only closed sessions can be deleted.' });
    }

    await pool.query('DELETE FROM sessions WHERE session_id = $1', [session_id]);

    return res.status(200).json({ message: 'Session deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  joinSession,
  leaveSession,
  endSession,
  deleteSession,
};
