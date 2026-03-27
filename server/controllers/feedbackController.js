const pool = require('../config/db');

const getBadgeLevel = (points) => {
  if (points >= 200) return 'Gold';
  if (points >= 100) return 'Silver';
  if (points >= 30) return 'Bronze';
  return 'Member';
};

const createFeedback = async (req, res) => {
  const { session_id, reviewed_user_id, rating, comment } = req.body;
  const reviewerId = req.user.user_id;

  if (!session_id || !reviewed_user_id || rating === undefined) {
    return res.status(400).json({ message: 'session_id, reviewed_user_id, and rating are required.' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sessionResult = await client.query('SELECT status FROM sessions WHERE session_id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (sessionResult.rows[0].status !== 'closed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Feedback can only be submitted for closed sessions.' });
    }

    const reviewerParticipantResult = await client.query(
      'SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [session_id, reviewerId]
    );
    if (reviewerParticipantResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'You were not a participant of this session.' });
    }

    const reviewedParticipantResult = await client.query(
      'SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [session_id, reviewed_user_id]
    );
    if (reviewedParticipantResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Reviewed user was not a participant of this session.' });
    }

    if (reviewerId === reviewed_user_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'You cannot review yourself.' });
    }

    const duplicateResult = await client.query(
      `
        SELECT 1
        FROM feedback
        WHERE session_id = $1 AND reviewer_id = $2 AND reviewed_user_id = $3
      `,
      [session_id, reviewerId, reviewed_user_id]
    );
    if (duplicateResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res
        .status(409)
        .json({ message: 'You have already submitted feedback for this user in this session.' });
    }

    const feedbackResult = await client.query(
      `
        INSERT INTO feedback (session_id, reviewer_id, reviewed_user_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING feedback_id, session_id, reviewer_id, reviewed_user_id, rating, comment, created_at
      `,
      [session_id, reviewerId, reviewed_user_id, rating, comment || null]
    );

    const pointsResult = await client.query(
      `
        UPDATE users
        SET contribution_points = contribution_points + 3
        WHERE user_id = $1
        RETURNING contribution_points
      `,
      [reviewed_user_id]
    );

    const points = pointsResult.rows[0].contribution_points;
    const badgeLevel = getBadgeLevel(points);
    await client.query('UPDATE users SET badge_level = $1 WHERE user_id = $2', [badgeLevel, reviewed_user_id]);

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Feedback submitted successfully.',
      feedback: feedbackResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

const getFeedbackBySession = async (req, res) => {
  const { session_id } = req.params;

  try {
    const sessionResult = await pool.query('SELECT 1 FROM sessions WHERE session_id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const feedbackResult = await pool.query(
      `
        SELECT
          f.feedback_id,
          f.session_id,
          f.reviewer_id,
          reviewer.name AS reviewer_name,
          f.reviewed_user_id,
          reviewed.name AS reviewed_user_name,
          f.rating,
          f.comment,
          f.created_at
        FROM feedback f
        JOIN users reviewer ON reviewer.user_id = f.reviewer_id
        JOIN users reviewed ON reviewed.user_id = f.reviewed_user_id
        WHERE f.session_id = $1
        ORDER BY f.created_at ASC
      `,
      [session_id]
    );

    return res.status(200).json({ feedback: feedbackResult.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getFeedbackByUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const userResult = await pool.query('SELECT 1 FROM users WHERE user_id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const [summaryResult, feedbackResult] = await Promise.all([
      pool.query(
        `
          SELECT
            COUNT(*)::int AS total_reviews,
            ROUND(AVG(rating)::numeric, 2) AS average_rating
          FROM feedback
          WHERE reviewed_user_id = $1
        `,
        [user_id]
      ),
      pool.query(
        `
          SELECT
            f.feedback_id,
            f.session_id,
            f.reviewer_id,
            u.name AS reviewer_name,
            f.rating,
            f.comment,
            f.created_at
          FROM feedback f
          JOIN users u ON u.user_id = f.reviewer_id
          WHERE f.reviewed_user_id = $1
          ORDER BY f.created_at DESC
        `,
        [user_id]
      ),
    ]);

    return res.status(200).json({
      summary: {
        user_id: Number(user_id),
        total_reviews: summaryResult.rows[0].total_reviews,
        average_rating: summaryResult.rows[0].average_rating,
      },
      feedback: feedbackResult.rows,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createFeedback,
  getFeedbackBySession,
  getFeedbackByUser,
};
