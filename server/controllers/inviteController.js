const pool = require('../config/db');

const normalizeStatus = (status) => (status === 'ongoing' ? 'open' : status);

const getMyInvites = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          i.invite_id,
          i.session_id,
          i.inviter_id,
          i.invitee_id,
          i.status,
          i.created_at,
          i.responded_at,
          s.topic,
          s.session_type,
          s.status AS session_status,
          u.name AS inviter_name,
          u.department AS inviter_department,
          u.role AS inviter_role
        FROM session_invites i
        JOIN sessions s ON s.session_id = i.session_id
        JOIN users u ON u.user_id = i.inviter_id
        WHERE i.invitee_id = $1
          AND i.status = 'pending'
        ORDER BY i.created_at DESC
      `,
      [req.user.user_id]
    );

    const invites = result.rows.map((row) => ({
      invite_id: row.invite_id,
      session_id: row.session_id,
      inviter_id: row.inviter_id,
      invitee_id: row.invitee_id,
      status: row.status,
      created_at: row.created_at,
      responded_at: row.responded_at,
      session: {
        topic: row.topic,
        session_type: row.session_type,
        status: normalizeStatus(row.session_status),
      },
      inviter: {
        name: row.inviter_name,
        department: row.inviter_department,
        role: row.inviter_role,
      },
    }));

    return res.status(200).json({ invites });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const createInvite = async (req, res) => {
  const { session_id, invitee_id } = req.body;
  const inviterId = req.user.user_id;

  if (!session_id || !invitee_id) {
    return res.status(400).json({ message: 'session_id and invitee_id are required.' });
  }

  const sessionId = Number(session_id);
  const inviteeId = Number(invitee_id);
  if (!Number.isInteger(sessionId) || !Number.isInteger(inviteeId)) {
    return res.status(400).json({ message: 'Invalid session_id or invitee_id.' });
  }

  if (inviteeId === inviterId) {
    return res.status(400).json({ message: 'You cannot invite yourself.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sessionResult = await client.query(
      'SELECT session_id, creator_id, session_type, status FROM sessions WHERE session_id = $1',
      [sessionId]
    );
    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Session not found.' });
    }

    const session = sessionResult.rows[0];
    if (session.creator_id !== inviterId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Only the session creator can invite users.' });
    }

    if (session.status === 'closed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Session is already closed.' });
    }

    const inviteeExists = await client.query('SELECT 1 FROM users WHERE user_id = $1', [inviteeId]);
    if (inviteeExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Invitee not found.' });
    }

    const participantCheck = await client.query(
      'SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, inviteeId]
    );
    if (participantCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'User is already a participant.' });
    }

    if (session.session_type === 'one-on-one') {
      const countResult = await client.query(
        'SELECT COUNT(*)::int AS participant_count FROM session_participants WHERE session_id = $1',
        [sessionId]
      );
      if (countResult.rows[0].participant_count >= 2) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'One-on-one session is already full.' });
      }
    }

    const insertResult = await client.query(
      `
        INSERT INTO session_invites (session_id, inviter_id, invitee_id)
        VALUES ($1, $2, $3)
        RETURNING invite_id, session_id, inviter_id, invitee_id, status, created_at
      `,
      [sessionId, inviterId, inviteeId]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      message: 'Invite sent successfully.',
      invite: insertResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ message: 'An invite is already pending for this user.' });
    }
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

const respondToInvite = async (req, res) => {
  const { invite_id } = req.params;
  const { response } = req.body;
  const userId = req.user.user_id;

  if (!response || (response !== 'accepted' && response !== 'declined')) {
    return res.status(400).json({ message: 'response must be accepted or declined.' });
  }

  const inviteId = Number(invite_id);
  if (!Number.isInteger(inviteId)) {
    return res.status(400).json({ message: 'Invalid invite id.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const inviteResult = await client.query(
      `
        SELECT invite_id, session_id, inviter_id, invitee_id, status
        FROM session_invites
        WHERE invite_id = $1
        FOR UPDATE
      `,
      [inviteId]
    );

    if (inviteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Invite not found.' });
    }

    const invite = inviteResult.rows[0];
    if (invite.invitee_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'You are not authorized to respond to this invite.' });
    }

    if (invite.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Invite has already been responded to.' });
    }

    if (response === 'declined') {
      await client.query(
        `
          UPDATE session_invites
          SET status = 'declined', responded_at = NOW()
          WHERE invite_id = $1
        `,
        [inviteId]
      );
      await client.query('COMMIT');
      return res.status(200).json({ message: 'Invite declined.' });
    }

    const sessionResult = await client.query('SELECT session_type, status FROM sessions WHERE session_id = $1', [
      invite.session_id,
    ]);
    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Session not found.' });
    }

    const session = sessionResult.rows[0];
    if (session.status === 'closed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Session is already closed.' });
    }

    const participantCheck = await client.query(
      'SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [invite.session_id, userId]
    );
    if (participantCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'You have already joined this session.' });
    }

    if (session.session_type === 'one-on-one') {
      const countResult = await client.query(
        'SELECT COUNT(*)::int AS participant_count FROM session_participants WHERE session_id = $1',
        [invite.session_id]
      );
      if (countResult.rows[0].participant_count >= 2) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'One-on-one session is already full.' });
      }
    }

    const participantResult = await client.query(
      `
        INSERT INTO session_participants (session_id, user_id, role)
        VALUES ($1, $2, 'participant')
        RETURNING participant_id, session_id, user_id, role, joined_at
      `,
      [invite.session_id, userId]
    );

    await client.query(
      `
        UPDATE session_invites
        SET status = 'accepted', responded_at = NOW()
        WHERE invite_id = $1
      `,
      [inviteId]
    );

    await client.query('COMMIT');
    return res.status(200).json({
      message: 'Invite accepted.',
      participant: participantResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

module.exports = {
  getMyInvites,
  createInvite,
  respondToInvite,
};
