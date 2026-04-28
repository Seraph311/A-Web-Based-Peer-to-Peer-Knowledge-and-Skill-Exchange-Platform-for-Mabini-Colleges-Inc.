const pool = require('../config/db');
const { verifyAndLoadUser } = require('../middleware/authMiddleware');

const toInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const roomName = (sessionId) => `session_${sessionId}`;
const emitSocketError = (socket, message) => {
  socket.emit('socket_error', { message });
};

const getSocketToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim().replace(/^Bearer\s+/i, '');
  }

  const authHeader = socket.handshake.headers?.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
};

module.exports = (io) => {
  io.on('connection', async (socket) => {
    const token = getSocketToken(socket);
    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      socket.data.user = await verifyAndLoadUser(token);
    } catch {
      socket.disconnect(true);
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('User connected:', socket.id);
    }

    socket.on('join_session', async ({ session_id }) => {
      const normalizedSessionId = toInt(session_id);
      if (normalizedSessionId === null) {
        emitSocketError(socket, 'Invalid session.');
        return;
      }

      try {
        const participantResult = await pool.query(
          'SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2',
          [normalizedSessionId, socket.data.user.user_id]
        );
        if (participantResult.rows.length === 0) {
          emitSocketError(socket, 'You are not a participant of this session.');
          return;
        }

        socket.join(roomName(normalizedSessionId));
        socket.to(roomName(normalizedSessionId)).emit('user_joined', { user_id: socket.data.user.user_id });
      } catch {
        emitSocketError(socket, 'Failed to join session room.');
      }
    });

    socket.on('send_message', async ({ session_id, content }) => {
      const normalizedSessionId = toInt(session_id);
      const messageContent = typeof content === 'string' ? content.trim() : '';
      if (normalizedSessionId === null || messageContent.length === 0) {
        emitSocketError(socket, 'Message is invalid.');
        return;
      }

      if (messageContent.length > 2000) {
        emitSocketError(socket, 'Message is too long.');
        return;
      }

      try {
        const membershipResult = await pool.query(
          `
            SELECT s.status
            FROM sessions s
            JOIN session_participants sp ON sp.session_id = s.session_id
            WHERE s.session_id = $1 AND sp.user_id = $2
          `,
          [normalizedSessionId, socket.data.user.user_id]
        );
        if (membershipResult.rows.length === 0) {
          emitSocketError(socket, 'You are not a participant of this session.');
          return;
        }

        if (membershipResult.rows[0].status === 'closed') {
          emitSocketError(socket, 'This session is already closed.');
          return;
        }

        const result = await pool.query(
          `INSERT INTO messages (session_id, sender_id, content)
           VALUES ($1, $2, $3) RETURNING *`,
          [normalizedSessionId, socket.data.user.user_id, messageContent]
        );
        const message = result.rows[0];
        const userResult = await pool.query('SELECT name FROM users WHERE user_id = $1', [socket.data.user.user_id]);
        const sender_name = userResult.rows[0]?.name || 'Unknown';
        io.to(roomName(normalizedSessionId)).emit('receive_message', {
          ...message,
          sender_name,
        });
      } catch {
        emitSocketError(socket, 'Failed to send message.');
      }
    });

    socket.on('leave_session', ({ session_id }) => {
      const normalizedSessionId = toInt(session_id);
      if (normalizedSessionId === null) return;
      socket.leave(roomName(normalizedSessionId));
      socket.to(roomName(normalizedSessionId)).emit('user_left', { user_id: socket.data.user.user_id });
    });

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('User disconnected:', socket.id);
      }
    });
  });
};
