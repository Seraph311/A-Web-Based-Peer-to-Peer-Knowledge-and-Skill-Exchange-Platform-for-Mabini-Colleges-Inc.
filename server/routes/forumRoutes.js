// forumRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { verifyAndLoadUser } = require('../middleware/authMiddleware');
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  deleteQuestion,
  updateQuestion,
  createAnswer,
  getAnswersByQuestionId,
  updateAnswer,
  voteAnswer,
} = require('../controllers/forumController');

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  try {
    req.user = await verifyAndLoadUser(token);
  } catch (err) {
    return next();
  }

  return next();
};

router.post('/questions', verifyToken, createQuestion);
router.get('/questions', getQuestions);
router.get('/questions/:question_id', getQuestionById);
router.put('/questions/:question_id', verifyToken, updateQuestion);
router.delete('/questions/:question_id', verifyToken, deleteQuestion);
router.post('/questions/:question_id/answers', verifyToken, createAnswer);
router.get('/questions/:question_id/answers', optionalAuth, getAnswersByQuestionId);
router.post('/questions/:question_id/answers/:answer_id/vote', verifyToken, voteAnswer);
router.post('/answers/:answer_id/vote', verifyToken, voteAnswer);
router.put('/answers/:answer_id', verifyToken, updateAnswer);

module.exports = router;
