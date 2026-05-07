// inviteRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getMyInvites, respondToInvite, createInvite } = require('../controllers/inviteController');

router.get('/', verifyToken, getMyInvites);
router.post('/', verifyToken, createInvite);
router.post('/:invite_id/respond', verifyToken, respondToInvite);

module.exports = router;
