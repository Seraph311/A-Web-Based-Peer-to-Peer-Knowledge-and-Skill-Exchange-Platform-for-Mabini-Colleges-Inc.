const pool = require('../config/db');
const supabase = require('../config/supabase');
const paginate = require('../utils/paginate');

const getPendingUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT user_id, name, email, department, role, id_number, id_document_url, status, created_at
        FROM users
        WHERE status = 'pending'
        ORDER BY created_at ASC
      `
    );

    return res.status(200).json({ users: result.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getAllUsers = async (req, res) => {
  const { status, role, department } = req.query;
  const { page, limit, offset } = paginate(req.query);
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }

  if (department) {
    values.push(department);
    conditions.push(`department = $${values.length}`);
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(' AND ')}`;
  }

  const listQuery = `
    SELECT user_id, name, email, department, role, id_number, id_document_url, status, created_at
    FROM users
    ${whereClause}
    ORDER BY created_at ASC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM users
    ${whereClause}
  `;

  try {
    const [usersResult, countResult] = await Promise.all([
      pool.query(listQuery, [...values, limit, offset]),
      pool.query(countQuery, values),
    ]);

    const total = countResult.rows[0].total;

    return res.status(200).json({
      users: usersResult.rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const approveUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const userResult = await pool.query('SELECT status FROM users WHERE user_id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (userResult.rows[0].status === 'approved') {
      return res.status(400).json({ message: 'User is already approved.' });
    }

    await pool.query(`UPDATE users SET status = 'approved', rejection_reason = NULL WHERE user_id = $1`, [user_id]);

    return res.status(200).json({ message: 'User approved successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const rejectUser = async (req, res) => {
  const { user_id } = req.params;
  const { reason } = req.body;

  try {
    const userResult = await pool.query('SELECT status FROM users WHERE user_id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (userResult.rows[0].status === 'rejected') {
      return res.status(400).json({ message: 'User is already rejected.' });
    }

    await pool.query('UPDATE users SET status = $1, rejection_reason = $2 WHERE user_id = $3', [
      'rejected',
      reason || null,
      user_id,
    ]);

    return res.status(200).json({ message: 'User rejected successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getDocumentUrl = async (req, res) => {
  const { user_id } = req.params;

  try {
    const userResult = await pool.query('SELECT id_document_url FROM users WHERE user_id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const idDocumentUrl = userResult.rows[0].id_document_url;
    if (!idDocumentUrl) {
      return res.status(404).json({ message: 'No document found for this user.' });
    }

    const bucketPrefix = `${process.env.SUPABASE_BUCKET}/`;
    const splitByBucket = idDocumentUrl.split(bucketPrefix);
    const filePath = splitByBucket[1];

    if (!filePath) {
      return res.status(500).json({ message: 'Could not generate document URL.' });
    }

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .createSignedUrl(filePath, 60);

    if (error || !data?.signedUrl) {
      return res.status(500).json({ message: 'Could not generate document URL.' });
    }

    return res.status(200).json({ signed_url: data.signedUrl });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  getDocumentUrl,
};
