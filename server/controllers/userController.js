const pool = require('../config/db');
const bcrypt = require('bcrypt');
const paginate = require('../utils/paginate');

const getUserProfileData = async (userId, includeSensitive = false) => {
  const userFields = includeSensitive
    ? `
      user_id,
      name,
      email,
      department,
      role,
      id_number,
      contribution_points,
      badge_level,
      is_available,
      created_at
    `
    : `
      user_id,
      name,
      department,
      role,
      contribution_points,
      badge_level,
      is_available,
      created_at
    `;

  const userResult = await pool.query(`SELECT ${userFields} FROM users WHERE user_id = $1`, [userId]);
  if (userResult.rows.length === 0) {
    return null;
  }

  const [ratingResult, answersResult, createdSessionsResult, joinedSessionsResult, skillsResult] =
    await Promise.all([
      pool.query('SELECT ROUND(AVG(rating)::numeric, 2) AS average_rating FROM feedback WHERE reviewed_user_id = $1', [
        userId,
      ]),
      pool.query('SELECT COUNT(*)::int AS total_answers FROM forum_answers WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*)::int AS total_sessions_created FROM sessions WHERE creator_id = $1', [userId]),
      pool.query(
        "SELECT COUNT(*)::int AS total_sessions_joined FROM session_participants WHERE user_id = $1 AND role = 'participant'",
        [userId]
      ),
      pool.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY skill_id ASC', [userId]),
    ]);

  const user = userResult.rows[0];

  return {
    ...user,
    average_rating: ratingResult.rows[0].average_rating,
    stats: {
      total_answers: answersResult.rows[0].total_answers,
      total_sessions_created: createdSessionsResult.rows[0].total_sessions_created,
      total_sessions_joined: joinedSessionsResult.rows[0].total_sessions_joined,
    },
    skills: skillsResult.rows,
  };
};

const getLeaderboard = async (req, res) => {
  const { department } = req.query;
  const { page, limit, offset } = paginate(req.query);

  const values = [];
  let whereClause = '';

  if (department) {
    values.push(department);
    whereClause = `WHERE u.department = $${values.length}`;
  }

  const query = `
    SELECT
      u.user_id,
      u.name,
      u.department,
      u.role,
      u.contribution_points,
      u.badge_level,
      (
        SELECT ROUND(AVG(f.rating)::numeric, 2)
        FROM feedback f
        WHERE f.reviewed_user_id = u.user_id
      ) AS average_rating
    FROM users u
    ${whereClause}
    ORDER BY u.contribution_points DESC, u.user_id ASC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM users u
    ${whereClause}
  `;

  try {
    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values),
    ]);

    const total = countResult.rows[0].total;

    const leaderboard = result.rows.map((row, index) => ({
      rank: offset + index + 1,
      user_id: row.user_id,
      name: row.name,
      department: row.department,
      role: row.role,
      contribution_points: row.contribution_points,
      badge_level: row.badge_level,
      average_rating: row.average_rating,
    }));

    return res.status(200).json({
      leaderboard,
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

const getUserProfile = async (req, res) => {
  const { user_id } = req.params;

  try {
    const profile = await getUserProfileData(user_id, false);
    if (!profile) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await getUserProfileData(req.user.user_id, true);
    if (!profile) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const updateMyProfile = async (req, res) => {
  const hasName = Object.prototype.hasOwnProperty.call(req.body, 'name');
  const hasDepartment = Object.prototype.hasOwnProperty.call(req.body, 'department');

  if (!hasName && !hasDepartment) {
    return res.status(400).json({ message: 'No fields to update.' });
  }

  const updates = [];
  const values = [];

  if (hasName) {
    if (typeof req.body.name !== 'string' || req.body.name.trim() === '') {
      return res.status(400).json({ message: 'name must not be an empty string.' });
    }
    values.push(req.body.name.trim());
    updates.push(`name = $${values.length}`);
  }

  if (hasDepartment) {
    if (typeof req.body.department !== 'string' || req.body.department.trim() === '') {
      return res.status(400).json({ message: 'department must not be an empty string.' });
    }
    values.push(req.body.department.trim());
    updates.push(`department = $${values.length}`);
  }

  values.push(req.user.user_id);

  const query = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE user_id = $${values.length}
    RETURNING user_id, name, email, department, role, contribution_points, badge_level, is_available
  `;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const updateMyAvailability = async (req, res) => {
  const { is_available } = req.body;

  if (typeof is_available !== 'boolean') {
    return res.status(400).json({ message: 'is_available must be a boolean.' });
  }

  try {
    const result = await pool.query('UPDATE users SET is_available = $1 WHERE user_id = $2 RETURNING is_available', [
      is_available,
      req.user.user_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Availability updated successfully.',
      is_available: result.rows[0].is_available,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const updateMyPassword = async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'current_password and new_password are required.' });
  }

  if (typeof new_password !== 'string' || new_password.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }

  if (current_password === new_password) {
    return res.status(400).json({ message: 'New password must be different from current password.' });
  }

  try {
    const userResult = await pool.query('SELECT password FROM users WHERE user_id = $1', [req.user.user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const passwordMatches = await bcrypt.compare(current_password, userResult.rows[0].password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE user_id = $2', [hashedPassword, req.user.user_id]);

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getLeaderboard,
  getUserProfile,
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  updateMyPassword,
};
