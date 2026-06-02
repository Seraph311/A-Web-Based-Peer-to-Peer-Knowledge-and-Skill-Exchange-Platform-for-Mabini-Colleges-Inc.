const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const supabase = require('../config/supabase');
const sendOTP = require('../utils/sendOTP');
const { v4: uuidv4 } = require('uuid');

const validRoles = ['student', 'instructor', 'alumni'];
const INSTITUTIONAL_DOMAIN = 'mabinicolleges.edu.ph';
const OTP_EXP_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const ensureOtpColumns = async () => {
  await pool.query(
    `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
      ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS otp_attempts INTEGER DEFAULT 0
    `
  );
};

const register = async (req, res) => {
  const { name, email, password, department, role, id_number } = req.body;
  const idDocument = req.file;
  const isInstitutionalEmail =
    typeof email === 'string' && email.toLowerCase().endsWith(`@${INSTITUTIONAL_DOMAIN}`);

  if (!name || !email || !password || !department || !role || !id_number) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (!isInstitutionalEmail && !idDocument) {
    return res.status(400).json({ message: 'ID document is required for non-institutional emails.' });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  try {
    await ensureOtpColumns();

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

    let idDocumentUrl = null;
    if (!isInstitutionalEmail) {
      const filename = `${uuidv4()}-${idDocument.originalname}`;
      const uploadResult = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(filename, idDocument.buffer, { contentType: idDocument.mimetype });

      if (uploadResult.error) {
        return res.status(500).json({ message: 'Document upload failed.' });
      }

      idDocumentUrl = `${process.env.SUPABASE_URL}/storage/v1/object/sign/${process.env.SUPABASE_BUCKET}/${filename}`;
    }

    const rejectedUser =
      (emailUser && emailUser.status === 'rejected' && emailUser) ||
      (idUser && idUser.status === 'rejected' && idUser);

    if (rejectedUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const otpCode = isInstitutionalEmail ? generateOTP() : null;

      await pool.query(
        `
          UPDATE users
          SET password = $1,
              id_document_url = COALESCE($2, id_document_url),
              status = 'pending',
              rejection_reason = NULL,
              otp_code = $4,
              otp_expires_at = CASE
                WHEN $4 IS NULL THEN NULL
                ELSE NOW() + ($5::text || ' minutes')::interval
              END,
              otp_attempts = CASE WHEN $4 IS NULL THEN otp_attempts ELSE 0 END
          WHERE user_id = $3
        `,
        [hashedPassword, idDocumentUrl, rejectedUser.user_id, otpCode, OTP_EXP_MINUTES]
      );

      if (isInstitutionalEmail) {
        await sendOTP(email, otpCode);
        return res.status(200).json({
          message: 'OTP sent to your institutional email.',
          requires_otp: true,
        });
      }

      return res.status(200).json({ message: 'Re-submission received. Awaiting admin approval.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (isInstitutionalEmail) {
      const otpCode = generateOTP();
      const insertQuery = `
        INSERT INTO users (
          name, email, password, department, role, id_number, status, id_document_url,
          otp_code, otp_expires_at, otp_attempts
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', NULL, $7, NOW() + ($8::text || ' minutes')::interval, 0)
        RETURNING user_id, name, email, department, role, id_number, status
      `;

      const result = await pool.query(insertQuery, [
        name,
        email,
        hashedPassword,
        department,
        role,
        id_number,
        otpCode,
        OTP_EXP_MINUTES,
      ]);

      await sendOTP(email, otpCode);

      return res.status(201).json({
        message: 'OTP sent to your institutional email.',
        requires_otp: true,
        user: result.rows[0],
      });
    }

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
      requires_otp: false,
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    await ensureOtpColumns();

    const query = await pool.query(
      `
        SELECT user_id, email, status, otp_code, otp_expires_at, otp_attempts,
               (otp_expires_at IS NOT NULL AND otp_expires_at > NOW()) AS otp_not_expired
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    if (query.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = query.rows[0];
    const isInstitutionalEmail =
      typeof user.email === 'string' && user.email.toLowerCase().endsWith(`@${INSTITUTIONAL_DOMAIN}`);

    if (!isInstitutionalEmail) {
      return res.status(400).json({ message: 'OTP verification is for institutional emails only.' });
    }

    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ message: 'No active OTP. Please request a new code.' });
    }

    if (user.otp_attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many failed attempts. Please resend OTP.' });
    }

    if (!user.otp_not_expired) {
      return res.status(400).json({ message: 'OTP has expired. Please resend OTP.' });
    }

    if (String(otp) !== String(user.otp_code)) {
      await pool.query('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE user_id = $1', [user.user_id]);
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    await pool.query(
      `
        UPDATE users
        SET status = 'approved',
            otp_code = NULL,
            otp_expires_at = NULL,
            otp_attempts = 0
        WHERE user_id = $1
      `,
      [user.user_id]
    );

    return res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    await ensureOtpColumns();

    const query = await pool.query(
      `
        SELECT user_id, email
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    if (query.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = query.rows[0];
    const isInstitutionalEmail =
      typeof user.email === 'string' && user.email.toLowerCase().endsWith(`@${INSTITUTIONAL_DOMAIN}`);

    if (!isInstitutionalEmail) {
      return res.status(400).json({ message: 'OTP resend is for institutional emails only.' });
    }

    const otpCode = generateOTP();
    await pool.query(
      `
        UPDATE users
        SET otp_code = $1,
            otp_expires_at = NOW() + ($2::text || ' minutes')::interval,
            otp_attempts = 0,
            status = 'pending'
        WHERE user_id = $3
      `,
      [otpCode, OTP_EXP_MINUTES, user.user_id]
    );

    await sendOTP(email, otpCode);

    return res.status(200).json({ message: 'OTP resent successfully.' });
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
  verifyOtp,
  resendOtp,
};
