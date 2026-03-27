// feedbackRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  createFeedback,
  getFeedbackBySession,
  getFeedbackByUser,
} = require('../controllers/feedbackController');

router.post('/', verifyToken, createFeedback);
router.get('/session/:session_id', getFeedbackBySession);
router.get('/user/:user_id', getFeedbackByUser);

module.exports = router;
