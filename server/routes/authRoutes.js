// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, verifyOtp, resendOtp } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

void verifyToken;

router.post('/register', upload.single('id_document'), register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

module.exports = router;
