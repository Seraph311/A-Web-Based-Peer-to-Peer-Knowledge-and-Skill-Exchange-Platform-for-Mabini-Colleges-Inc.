// forumRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  deleteQuestion,
  updateQuestion,
  createAnswer,
  getAnswersByQuestionId,
  updateAnswer,
} = require('../controllers/forumController');

router.post('/questions', verifyToken, createQuestion);
router.get('/questions', getQuestions);
router.get('/questions/:question_id', getQuestionById);
router.put('/questions/:question_id', verifyToken, updateQuestion);
router.delete('/questions/:question_id', verifyToken, deleteQuestion);
router.post('/questions/:question_id/answers', verifyToken, createAnswer);
router.get('/questions/:question_id/answers', getAnswersByQuestionId);
router.put('/answers/:answer_id', verifyToken, updateAnswer);

module.exports = router;
