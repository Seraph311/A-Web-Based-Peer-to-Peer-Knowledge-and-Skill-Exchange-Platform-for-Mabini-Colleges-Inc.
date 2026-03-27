const pool = require('../config/db');
const paginate = require('../utils/paginate');

const createQuestion = async (req, res) => {
  const { title, content, topic_tag, department_tag } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO forum_questions (user_id, title, content, topic_tag, department_tag)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING question_id, user_id, title, content, topic_tag, department_tag, created_at
      `,
      [req.user.user_id, title, content, topic_tag || null, department_tag || null]
    );

    return res.status(201).json({
      message: 'Question posted successfully.',
      question: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getQuestions = async (req, res) => {
  const { keyword, department_tag } = req.query;
  const { page, limit, offset } = paginate(req.query);
  const conditions = [];
  const values = [];

  if (keyword) {
    values.push(`%${keyword}%`);
    const keywordParam = `$${values.length}`;
    conditions.push(`(
      title ILIKE ${keywordParam}
      OR content ILIKE ${keywordParam}
      OR topic_tag ILIKE ${keywordParam}
      OR department_tag ILIKE ${keywordParam}
    )`);
  }

  if (department_tag) {
    values.push(department_tag);
    conditions.push(`department_tag = $${values.length}`);
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = ` WHERE ${conditions.join(' AND ')}`;
  }
  const listQuery = `
    SELECT *
    FROM forum_questions
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM forum_questions
    ${whereClause}
  `;

  try {
    const [result, countResult] = await Promise.all([
      pool.query(listQuery, [...values, limit, offset]),
      pool.query(countQuery, values),
    ]);

    const total = countResult.rows[0].total;

    return res.status(200).json({
      questions: result.rows,
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

const getQuestionById = async (req, res) => {
  const { question_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM forum_questions WHERE question_id = $1', [question_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    return res.status(200).json({ question: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const createAnswer = async (req, res) => {
  const { question_id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Answer content is required.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const questionCheck = await client.query('SELECT 1 FROM forum_questions WHERE question_id = $1', [question_id]);
    if (questionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Question not found.' });
    }

    const answerResult = await client.query(
      `
        INSERT INTO forum_answers (question_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING answer_id, question_id, user_id, content, created_at
      `,
      [question_id, req.user.user_id, content]
    );

    const pointsResult = await client.query(
      `
        UPDATE users
        SET contribution_points = contribution_points + 5
        WHERE user_id = $1
        RETURNING contribution_points
      `,
      [req.user.user_id]
    );

    const points = pointsResult.rows[0].contribution_points;
    let badgeLevel = 'Member';
    if (points >= 200) {
      badgeLevel = 'Gold';
    } else if (points >= 100) {
      badgeLevel = 'Silver';
    } else if (points >= 30) {
      badgeLevel = 'Bronze';
    }

    await client.query('UPDATE users SET badge_level = $1 WHERE user_id = $2', [badgeLevel, req.user.user_id]);

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Answer posted successfully.',
      answer: answerResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

const getAnswersByQuestionId = async (req, res) => {
  const { question_id } = req.params;

  try {
    const questionCheck = await pool.query('SELECT 1 FROM forum_questions WHERE question_id = $1', [question_id]);
    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const result = await pool.query(
      'SELECT * FROM forum_answers WHERE question_id = $1 ORDER BY created_at ASC',
      [question_id]
    );

    return res.status(200).json({ answers: result.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  createAnswer,
  getAnswersByQuestionId,
};
