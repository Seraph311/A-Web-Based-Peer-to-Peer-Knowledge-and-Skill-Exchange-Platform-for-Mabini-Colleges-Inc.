const pool = require('../config/db');
const paginate = require('../utils/paginate');

const createSkill = async (req, res) => {
  const { skill_name, description } = req.body;

  if (!skill_name) {
    return res.status(400).json({ message: 'Skill name is required.' });
  }

  try {
    const duplicateCheck = await pool.query(
      'SELECT 1 FROM skills WHERE user_id = $1 AND LOWER(skill_name) = LOWER($2)',
      [req.user.user_id, skill_name]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ message: 'You have already registered this skill.' });
    }

    const result = await pool.query(
      `
        INSERT INTO skills (user_id, skill_name, description)
        VALUES ($1, $2, $3)
        RETURNING skill_id, user_id, skill_name, description, is_available
      `,
      [req.user.user_id, skill_name, description || null]
    );

    return res.status(201).json({
      message: 'Skill registered successfully.',
      skill: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getMySkills = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY skill_id ASC', [
      req.user.user_id,
    ]);

    return res.status(200).json({ skills: result.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const updateSkill = async (req, res) => {
  const { skill_id } = req.params;
  const { skill_name, description, is_available } = req.body;

  try {
    const existingResult = await pool.query('SELECT * FROM skills WHERE skill_id = $1', [skill_id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    const existingSkill = existingResult.rows[0];
    if (existingSkill.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const hasSkillName = Object.prototype.hasOwnProperty.call(req.body, 'skill_name');
    const hasDescription = Object.prototype.hasOwnProperty.call(req.body, 'description');
    const hasAvailability = Object.prototype.hasOwnProperty.call(req.body, 'is_available');

    if (!hasSkillName && !hasDescription && !hasAvailability) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    const updates = [];
    const values = [];

    if (hasSkillName) {
      values.push(skill_name);
      updates.push(`skill_name = $${values.length}`);
    }

    if (hasDescription) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }

    if (hasAvailability) {
      values.push(is_available);
      updates.push(`is_available = $${values.length}`);
    }

    values.push(skill_id);

    const query = `
      UPDATE skills
      SET ${updates.join(', ')}
      WHERE skill_id = $${values.length}
      RETURNING *
    `;

    const updatedResult = await pool.query(query, values);

    return res.status(200).json({
      message: 'Skill updated successfully.',
      skill: updatedResult.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const deleteSkill = async (req, res) => {
  const { skill_id } = req.params;

  try {
    const existingResult = await pool.query('SELECT * FROM skills WHERE skill_id = $1', [skill_id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    const existingSkill = existingResult.rows[0];
    if (existingSkill.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    await pool.query('DELETE FROM skills WHERE skill_id = $1', [skill_id]);

    return res.status(200).json({ message: 'Skill deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const searchSkills = async (req, res) => {
  const { keyword } = req.query;
  const { page, limit, offset } = paginate(req.query);

  if (!keyword) {
    return res.status(400).json({ message: 'Search keyword is required.' });
  }

  try {
    const countResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM skills s
        WHERE s.skill_name ILIKE $1
          AND s.is_available = true
      `,
      [`%${keyword}%`]
    );

    const result = await pool.query(
      `
        SELECT
          s.skill_id,
          s.skill_name,
          s.description,
          s.is_available,
          u.user_id,
          u.name,
          u.department,
          u.role,
          u.contribution_points,
          u.badge_level,
          ROUND(AVG(f.rating)::numeric, 2) AS average_rating
        FROM skills s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN feedback f ON f.reviewed_user_id = u.user_id
        WHERE s.skill_name ILIKE $1
          AND s.is_available = true
        GROUP BY
          s.skill_id,
          s.skill_name,
          s.description,
          s.is_available,
          u.user_id,
          u.name,
          u.department,
          u.role,
          u.contribution_points,
          u.badge_level
        ORDER BY average_rating DESC NULLS LAST
        LIMIT $2
        OFFSET $3
      `,
      [`%${keyword}%`, limit, offset]
    );

    const results = result.rows.map((row) => ({
      skill_id: row.skill_id,
      skill_name: row.skill_name,
      description: row.description,
      is_available: row.is_available,
      user: {
        user_id: row.user_id,
        name: row.name,
        department: row.department,
        role: row.role,
        contribution_points: row.contribution_points,
        badge_level: row.badge_level,
        average_rating: row.average_rating,
      },
    }));

    const total = countResult.rows[0].total;

    return res.status(200).json({
      results,
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

module.exports = {
  createSkill,
  getMySkills,
  updateSkill,
  deleteSkill,
  searchSkills,
};
