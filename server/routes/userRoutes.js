// userRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getLeaderboard,
  getUserProfile,
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  updateMyPassword,
} = require('../controllers/userController');

router.get('/leaderboard', getLeaderboard);
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);
router.put('/me/availability', verifyToken, updateMyAvailability);
router.put('/me/password', verifyToken, updateMyPassword);
router.get('/profile/:user_id', getUserProfile);

module.exports = router;
