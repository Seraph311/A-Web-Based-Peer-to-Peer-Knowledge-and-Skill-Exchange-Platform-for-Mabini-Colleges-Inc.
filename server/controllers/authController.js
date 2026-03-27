const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const validRoles = ['student', 'instructor', 'alumni'];

const register = async (req, res) => {
  const { name, email, password, department, role, id_number } = req.body;

  if (!name || !email || !password || !department || !role || !id_number) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  try {
    const emailCheck = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const idCheck = await pool.query('SELECT 1 FROM users WHERE id_number = $1', [id_number]);
    if (idCheck.rows.length > 0) {
      return res.status(409).json({ message: 'ID number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, email, password, department, role, id_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, name, email, department, role, id_number
    `;

    const result = await pool.query(insertQuery, [
      name,
      email,
      hashedPassword,
      department,
      role,
      id_number,
    ]);

    return res.status(201).json({
      message: 'Registration successful.',
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const userQuery = await pool.query(
      'SELECT user_id, name, email, password, role, department FROM users WHERE email = $1',
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = userQuery.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  register,
  login,
};
