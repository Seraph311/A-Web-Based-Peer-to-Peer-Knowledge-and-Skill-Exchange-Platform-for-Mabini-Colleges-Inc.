// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

void verifyToken;

router.post('/register', upload.single('id_document'), register);
router.post('/login', login);

module.exports = router;
