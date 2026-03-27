// messageRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getMessagesBySessionId } = require('../controllers/messageController');

router.get('/:session_id', verifyToken, getMessagesBySessionId);

module.exports = router;
