module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_session', (sessionId) => {
      socket.join(`session_${sessionId}`);
    });

    socket.on('send_message', ({ sessionId, senderId, content }) => {
      io.to(`session_${sessionId}`).emit('receive_message', {
        senderId,
        content,
        sent_at: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
