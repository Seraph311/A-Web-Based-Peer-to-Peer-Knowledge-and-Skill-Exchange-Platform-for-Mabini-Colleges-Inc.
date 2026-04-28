const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const forumRoutes = require('./routes/forumRoutes');
const skillRoutes = require('./routes/skillRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const socketHandler = require('./socket/socketHandler');
const sanitizeBody = require('./middleware/sanitize');
const { generalLimiter, authLimiter, reportLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);
const fallbackOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : fallbackOrigins;

const isOriginAllowed = (origin) => !origin || allowedOrigins.includes(origin);
const corsOriginHandler = (origin, callback) => {
  if (isOriginAllowed(origin)) {
    return callback(null, true);
  }
  return callback(new Error('Origin not allowed by CORS.'));
};

const corsOptions = {
  origin: corsOriginHandler,
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  allowUpgrades: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(sanitizeBody);
app.use(generalLimiter);
app.use(express.static('../client'));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportLimiter, reportRoutes);
app.use('/api/admin', adminRoutes);

socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`StudyBridge server running on port ${PORT}`);
});
