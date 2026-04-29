const pool = require('../config/db');
const paginate = require('../utils/paginate');

const ensureForumEditColumns = async () => {
  await pool.query('ALTER TABLE forum_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP');
  await pool.query('ALTER TABLE forum_answers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP');
};

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

const deleteQuestion = async (req, res) => {
  const { question_id } = req.params;

  try {
    const questionResult = await pool.query('SELECT * FROM forum_questions WHERE question_id = $1', [question_id]);

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const question = questionResult.rows[0];
    if (question.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    await pool.query('DELETE FROM forum_questions WHERE question_id = $1', [question_id]);

    return res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const updateQuestion = async (req, res) => {
  const { question_id } = req.params;
  const { title, content, topic_tag, department_tag } = req.body;
  const hasTitle = Object.prototype.hasOwnProperty.call(req.body, 'title');
  const hasContent = Object.prototype.hasOwnProperty.call(req.body, 'content');
  const hasTopicTag = Object.prototype.hasOwnProperty.call(req.body, 'topic_tag');
  const hasDepartmentTag = Object.prototype.hasOwnProperty.call(req.body, 'department_tag');

  if (!hasTitle && !hasContent && !hasTopicTag && !hasDepartmentTag) {
    return res.status(400).json({ message: 'No updates provided.' });
  }

  try {
    await ensureForumEditColumns();
    const questionResult = await pool.query('SELECT user_id FROM forum_questions WHERE question_id = $1', [question_id]);

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    if (questionResult.rows[0].user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const updates = [];
    const values = [];

    if (hasTitle) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty.' });
      }
      values.push(title.trim());
      updates.push(`title = $${values.length}`);
    }

    if (hasContent) {
      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: 'Content cannot be empty.' });
      }
      values.push(content.trim());
      updates.push(`content = $${values.length}`);
    }

    if (hasTopicTag) {
      if (topic_tag !== null && typeof topic_tag !== 'string') {
        return res.status(400).json({ message: 'Invalid topic tag.' });
      }
      const normalized = typeof topic_tag === 'string' ? topic_tag.trim() : null;
      values.push(normalized || null);
      updates.push(`topic_tag = $${values.length}`);
    }

    if (hasDepartmentTag) {
      if (department_tag !== null && typeof department_tag !== 'string') {
        return res.status(400).json({ message: 'Invalid department tag.' });
      }
      const normalized = typeof department_tag === 'string' ? department_tag.trim() : null;
      values.push(normalized || null);
      updates.push(`department_tag = $${values.length}`);
    }

    updates.push('updated_at = NOW()');
    values.push(question_id);

    const updateResult = await pool.query(
      `
        UPDATE forum_questions
        SET ${updates.join(', ')}
        WHERE question_id = $${values.length}
        RETURNING question_id, user_id, title, content, topic_tag, department_tag, created_at, updated_at
      `,
      values
    );

    return res.status(200).json({
      message: 'Question updated successfully.',
      question: updateResult.rows[0],
    });
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
        RETURNING answer_id, question_id, user_id, content, upvotes, downvotes, created_at
      `,
      [question_id, req.user.user_id, content]
    );

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
  const userId = req.user?.user_id ?? null;

  try {
    const questionCheck = await pool.query('SELECT 1 FROM forum_questions WHERE question_id = $1', [question_id]);
    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const result = await pool.query(
      `SELECT fa.*,
         COALESCE(
           (SELECT vote_type FROM answer_votes
            WHERE answer_id = fa.answer_id AND user_id = $2), null
         ) AS user_vote
       FROM forum_answers fa
       WHERE fa.question_id = $1
       ORDER BY fa.created_at ASC`,
      [question_id, userId]
    );

    return res.status(200).json({ answers: result.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const updateAnswer = async (req, res) => {
  const { answer_id } = req.params;
  const { content } = req.body;
  const hasContent = Object.prototype.hasOwnProperty.call(req.body, 'content');

  if (!hasContent) {
    return res.status(400).json({ message: 'Content is required.' });
  }

  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ message: 'Content cannot be empty.' });
  }

  try {
    await ensureForumEditColumns();
    const answerResult = await pool.query('SELECT user_id FROM forum_answers WHERE answer_id = $1', [answer_id]);

    if (answerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Answer not found.' });
    }

    if (answerResult.rows[0].user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const updateResult = await pool.query(
      `
        UPDATE forum_answers
        SET content = $1,
            updated_at = NOW()
        WHERE answer_id = $2
        RETURNING answer_id, question_id, user_id, content, created_at, updated_at
      `,
      [content.trim(), answer_id]
    );

    return res.status(200).json({
      message: 'Answer updated successfully.',
      answer: updateResult.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

const voteAnswer = async (req, res) => {
  const { answer_id } = req.params;
  const { vote_type } = req.body;

  if (vote_type !== 'upvote' && vote_type !== 'downvote') {
    return res.status(400).json({ message: 'vote_type must be upvote or downvote.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const answerResult = await client.query(
      'SELECT answer_id, question_id, user_id, upvotes, downvotes FROM forum_answers WHERE answer_id = $1',
      [answer_id]
    );

    if (answerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Answer not found.' });
    }

    const answer = answerResult.rows[0];
    if (answer.user_id === req.user.user_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'You cannot vote on your own answer.' });
    }

    const existingVoteResult = await client.query(
      'SELECT vote_type FROM answer_votes WHERE answer_id = $1 AND user_id = $2',
      [answer_id, req.user.user_id]
    );

    const existingVote = existingVoteResult.rows[0]?.vote_type || null;
    let pointDelta = 0;
    let userVote = vote_type;

    if (!existingVote) {
      await client.query(
        'INSERT INTO answer_votes (answer_id, user_id, vote_type) VALUES ($1, $2, $3)',
        [answer_id, req.user.user_id, vote_type]
      );

      if (vote_type === 'upvote') {
        await client.query(
          'UPDATE forum_answers SET upvotes = GREATEST(0, upvotes + 1) WHERE answer_id = $1',
          [answer_id]
        );
        pointDelta = 1;
      } else {
        await client.query(
          'UPDATE forum_answers SET downvotes = GREATEST(0, downvotes + 1) WHERE answer_id = $1',
          [answer_id]
        );
        pointDelta = -1;
      }
    } else if (existingVote === vote_type) {
      await client.query('DELETE FROM answer_votes WHERE answer_id = $1 AND user_id = $2', [
        answer_id,
        req.user.user_id,
      ]);

      if (existingVote === 'upvote') {
        await client.query(
          'UPDATE forum_answers SET upvotes = GREATEST(0, upvotes - 1) WHERE answer_id = $1',
          [answer_id]
        );
        pointDelta = -1;
      } else {
        await client.query(
          'UPDATE forum_answers SET downvotes = GREATEST(0, downvotes - 1) WHERE answer_id = $1',
          [answer_id]
        );
        pointDelta = 1;
      }
      userVote = null;
    } else {
      await client.query(
        'UPDATE answer_votes SET vote_type = $1 WHERE answer_id = $2 AND user_id = $3',
        [vote_type, answer_id, req.user.user_id]
      );

      if (vote_type === 'downvote') {
        await client.query(
          `UPDATE forum_answers
           SET upvotes = GREATEST(0, upvotes - 1),
               downvotes = GREATEST(0, downvotes + 1)
           WHERE answer_id = $1`,
          [answer_id]
        );
        pointDelta = -2;
      } else {
        await client.query(
          `UPDATE forum_answers
           SET downvotes = GREATEST(0, downvotes - 1),
               upvotes = GREATEST(0, upvotes + 1)
           WHERE answer_id = $1`,
          [answer_id]
        );
        pointDelta = 2;
      }
    }

    const pointsResult = await client.query(
      `UPDATE users
       SET contribution_points = GREATEST(0, contribution_points + $1)
       WHERE user_id = $2
       RETURNING contribution_points`,
      [pointDelta, answer.user_id]
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

    await client.query('UPDATE users SET badge_level = $1 WHERE user_id = $2', [badgeLevel, answer.user_id]);

    const updatedAnswerResult = await client.query(
      'SELECT answer_id, upvotes, downvotes FROM forum_answers WHERE answer_id = $1',
      [answer_id]
    );

    await client.query('COMMIT');

    const updatedAnswer = updatedAnswerResult.rows[0];
    return res.status(200).json({
      message: 'Vote recorded.',
      answer: {
        ...updatedAnswer,
        net_votes: updatedAnswer.upvotes - updatedAnswer.downvotes,
      },
      user_vote: userVote,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    client.release();
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  deleteQuestion,
  updateQuestion,
  createAnswer,
  getAnswersByQuestionId,
  updateAnswer,
  voteAnswer,
};
