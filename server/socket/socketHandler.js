const pool = require('../config/db');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a session room
    socket.on('join_session', ({ session_id, user_id }) => {
      socket.join(`session_${session_id}`);
      socket.to(`session_${session_id}`).emit('user_joined', { user_id });
    });

    // Send a message - persists to DB and broadcasts to room
    socket.on('send_message', async ({ session_id, sender_id, content }) => {
      if (!session_id || !sender_id || !content) return;
      try {
        const result = await pool.query(
          `INSERT INTO messages (session_id, sender_id, content)
           VALUES ($1, $2, $3) RETURNING *`,
          [session_id, sender_id, content]
        );
        const message = result.rows[0];
        // Fetch sender name
        const userResult = await pool.query(`SELECT name FROM users WHERE user_id = $1`, [sender_id]);
        const sender_name = userResult.rows[0]?.name || 'Unknown';
        io.to(`session_${session_id}`).emit('receive_message', {
          ...message,
          sender_name,
        });
      } catch (err) {
        console.error('Socket message error:', err.message);
      }
    });

    // Leave a session room
    socket.on('leave_session', ({ session_id, user_id }) => {
      socket.leave(`session_${session_id}`);
      socket.to(`session_${session_id}`).emit('user_left', { user_id });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
