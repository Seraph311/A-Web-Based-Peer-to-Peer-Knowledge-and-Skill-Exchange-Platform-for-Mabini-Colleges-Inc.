const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  getDocumentUrl,
} = require('../controllers/adminController');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }
  next();
};

router.get('/users/pending', verifyToken, adminOnly, getPendingUsers);
router.get('/users', verifyToken, adminOnly, getAllUsers);
router.put('/users/:user_id/approve', verifyToken, adminOnly, approveUser);
router.put('/users/:user_id/reject', verifyToken, adminOnly, rejectUser);
router.get('/users/:user_id/document', verifyToken, adminOnly, getDocumentUrl);

module.exports = router;
