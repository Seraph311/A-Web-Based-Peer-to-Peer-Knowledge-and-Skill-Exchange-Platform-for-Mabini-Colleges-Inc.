const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const verifyAndLoadUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const result = await pool.query('SELECT status, role FROM users WHERE user_id = $1', [decoded.user_id]);

  if (result.rows.length === 0) {
    const error = new Error('User no longer exists.');
    error.status = 401;
    throw error;
  }

  const { status, role } = result.rows[0];
  if (role !== 'admin' && status === 'pending') {
    const error = new Error('Your account is pending approval. Please wait for admin verification.');
    error.status = 403;
    throw error;
  }

  if (role !== 'admin' && status === 'rejected') {
    const error = new Error('Your account has been rejected. Please re-submit your documents.');
    error.status = 403;
    throw error;
  }

  return { ...decoded, role, status };
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    req.user = await verifyAndLoadUser(token);
    next();
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
module.exports.verifyAndLoadUser = verifyAndLoadUser;
