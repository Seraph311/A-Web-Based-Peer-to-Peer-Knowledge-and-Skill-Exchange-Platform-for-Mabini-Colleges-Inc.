const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const result = await pool.query(
      'SELECT status, role FROM users WHERE user_id = $1',
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    const { status, role } = result.rows[0];

    if (role !== 'admin' && status === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending approval. Please wait for admin verification.'
      });
    }

    if (role !== 'admin' && status === 'rejected') {
      return res.status(403).json({
        message: 'Your account has been rejected. Please re-submit your documents.'
      });
    }

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
