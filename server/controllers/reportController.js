const pool = require('../config/db');
const paginate = require('../utils/paginate');

const validContentTypes = ['forum_question', 'forum_answer', 'session', 'message', 'user'];

const contentLookup = {
  forum_question: { table: 'forum_questions', column: 'question_id' },
  forum_answer: { table: 'forum_answers', column: 'answer_id' },
  session: { table: 'sessions', column: 'session_id' },
  message: { table: 'messages', column: 'message_id' },
  user: { table: 'users', column: 'user_id' },
};

const createReport = async (req, res) => {
  const { content_type, content_id, reason } = req.body;
  const reporterId = req.user.user_id;

  if (!content_type || content_id === undefined || !reason) {
    return res.status(400).json({ message: 'content_type, content_id, and reason are required.' });
  }

  if (!validContentTypes.includes(content_type)) {
    return res.status(400).json({ message: 'Invalid content_type.' });
  }

  const numericContentId = Number(content_id);
  if (!Number.isInteger(numericContentId)) {
    return res.status(404).json({ message: 'Reported content not found.' });
  }

  if (content_type === 'user' && numericContentId === reporterId) {
    return res.status(400).json({ message: 'You cannot report yourself.' });
  }

  const lookup = contentLookup[content_type];

  try {
    const contentCheck = await pool.query(
      `SELECT 1 FROM ${lookup.table} WHERE ${lookup.column} = $1 LIMIT 1`,
      [numericContentId]
    );
    if (contentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Reported content not found.' });
    }

    const duplicateCheck = await pool.query(
      `
        SELECT 1
        FROM reports
        WHERE reporter_id = $1 AND content_type = $2 AND content_id = $3
      `,
      [reporterId, content_type, numericContentId]
    );
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ message: 'You have already reported this content.' });
    }

    const result = await pool.query(
      `
        INSERT INTO reports (reporter_id, content_type, content_id, reason)
        VALUES ($1, $2, $3, $4)
        RETURNING report_id, reporter_id, content_type, content_id, reason, status, created_at
      `,
      [reporterId, content_type, numericContentId, reason]
    );

    return res.status(201).json({
      message: 'Report submitted successfully.',
      report: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getReports = async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access restricted to instructors only.' });
  }

  const { status, content_type } = req.query;
  const { page, limit, offset } = paginate(req.query);
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }

  if (content_type) {
    values.push(content_type);
    conditions.push(`r.content_type = $${values.length}`);
  }

  let query = `
    SELECT
      r.report_id,
      r.reporter_id,
      u.name AS reporter_name,
      r.content_type,
      r.content_id,
      r.reason,
      r.status,
      r.created_at
    FROM reports r
    JOIN users u ON u.user_id = r.reporter_id
  `;

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY r.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

  let countQuery = 'SELECT COUNT(*)::int AS total FROM reports r';
  if (conditions.length > 0) {
    countQuery += ` WHERE ${conditions.join(' AND ')}`;
  }

  try {
    const [result, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values),
    ]);

    const total = countResult.rows[0].total;

    return res.status(200).json({
      reports: result.rows,
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

const updateReportStatus = async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access restricted to instructors only.' });
  }

  const { report_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  if (status !== 'reviewed' && status !== 'dismissed') {
    return res.status(400).json({ message: 'Status must be reviewed or dismissed.' });
  }

  try {
    const existing = await pool.query('SELECT 1 FROM reports WHERE report_id = $1', [report_id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    const result = await pool.query(
      `
        UPDATE reports
        SET status = $1
        WHERE report_id = $2
        RETURNING report_id, content_type, content_id, reason, status, created_at
      `,
      [status, report_id]
    );

    return res.status(200).json({
      message: 'Report status updated successfully.',
      report: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
};
