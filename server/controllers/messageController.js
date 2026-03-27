const pool = require('../config/db');

const getMessagesBySessionId = async (req, res) => {
  const { session_id } = req.params;
  const userId = req.user.user_id;

  try {
    const sessionResult = await pool.query('SELECT 1 FROM sessions WHERE session_id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const participantResult = await pool.query(
      'SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [session_id, userId]
    );
    if (participantResult.rows.length === 0) {
      return res.status(403).json({ message: 'You are not a participant of this session.' });
    }

    const messagesResult = await pool.query(
      `
        SELECT
          m.message_id,
          m.session_id,
          m.sender_id,
          u.name AS sender_name,
          m.content,
          m.sent_at
        FROM messages m
        JOIN users u ON u.user_id = m.sender_id
        WHERE m.session_id = $1
        ORDER BY m.sent_at ASC
      `,
      [session_id]
    );

    return res.status(200).json({ messages: messagesResult.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getMessagesBySessionId,
};
