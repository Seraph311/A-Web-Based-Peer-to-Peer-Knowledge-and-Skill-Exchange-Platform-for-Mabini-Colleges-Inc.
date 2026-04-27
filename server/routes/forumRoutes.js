// forumRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  deleteQuestion,
  createAnswer,
  getAnswersByQuestionId,
} = require('../controllers/forumController');

router.post('/questions', verifyToken, createQuestion);
router.get('/questions', getQuestions);
router.get('/questions/:question_id', getQuestionById);
router.delete('/questions/:question_id', verifyToken, deleteQuestion);
router.post('/questions/:question_id/answers', verifyToken, createAnswer);
router.get('/questions/:question_id/answers', getAnswersByQuestionId);

module.exports = router;
