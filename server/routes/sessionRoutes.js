// sessionRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  createSession,
  getSessions,
  getSessionById,
  joinSession,
  leaveSession,
  endSession,
  deleteSession,
} = require('../controllers/sessionController');

router.post('/', verifyToken, createSession);
router.get('/', getSessions);
router.get('/:session_id', getSessionById);
router.post('/:session_id/join', verifyToken, joinSession);
router.post('/:session_id/leave', verifyToken, leaveSession);
router.post('/:session_id/end', verifyToken, endSession);
router.delete('/:session_id', verifyToken, deleteSession);

module.exports = router;
