const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const validRoles = ['student', 'instructor', 'alumni'];

const register = async (req, res) => {
  const { name, email, password, department, role, id_number } = req.body;
  const idDocument = req.file;

  if (!name || !email || !password || !department || !role || !id_number || !idDocument) {
    return res.status(400).json({ message: 'All fields including ID document are required.' });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  try {
    const emailCheck = await pool.query('SELECT user_id, status FROM users WHERE email = $1', [email]);
    const idCheck = await pool.query('SELECT user_id, status FROM users WHERE id_number = $1', [id_number]);

    const emailUser = emailCheck.rows[0] || null;
    const idUser = idCheck.rows[0] || null;

    if (emailUser && emailUser.status !== 'rejected') {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    if (idUser && idUser.status !== 'rejected') {
      return res.status(409).json({ message: 'ID number already registered.' });
    }

    const filename = `${uuidv4()}-${idDocument.originalname}`;
    const uploadResult = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, idDocument.buffer, { contentType: idDocument.mimetype });

    if (uploadResult.error) {
      return res.status(500).json({ message: 'Document upload failed.' });
    }

    const idDocumentUrl = `${process.env.SUPABASE_URL}/storage/v1/object/sign/${process.env.SUPABASE_BUCKET}/${filename}`;

    const rejectedUser =
      (emailUser && emailUser.status === 'rejected' && emailUser) ||
      (idUser && idUser.status === 'rejected' && idUser);

    if (rejectedUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        `
          UPDATE users
          SET password = $1,
              id_document_url = $2,
              status = 'pending',
              rejection_reason = NULL
          WHERE user_id = $3
        `,
        [hashedPassword, idDocumentUrl, rejectedUser.user_id]
      );

      return res.status(200).json({ message: 'Re-submission received. Awaiting admin approval.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, email, password, department, role, id_number, status, id_document_url)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
      RETURNING user_id, name, email, department, role, id_number, status
    `;

    const result = await pool.query(insertQuery, [
      name,
      email,
      hashedPassword,
      department,
      role,
      id_number,
      idDocumentUrl,
    ]);

    return res.status(201).json({
      message: 'Registration submitted. Awaiting admin approval.',
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
      'SELECT user_id, name, email, password, role, department, status, rejection_reason FROM users WHERE email = $1',
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
        status: user.status,
        ...(user.status === 'rejected' ? { rejection_reason: user.rejection_reason } : {}),
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
