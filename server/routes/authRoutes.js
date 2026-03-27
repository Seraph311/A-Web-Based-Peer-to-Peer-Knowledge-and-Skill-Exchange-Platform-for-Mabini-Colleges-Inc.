// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

void verifyToken;

router.post('/register', register);
router.post('/login', login);

module.exports = router;
