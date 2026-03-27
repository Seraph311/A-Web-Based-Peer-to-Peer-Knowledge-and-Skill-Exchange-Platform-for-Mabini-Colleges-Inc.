const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const skippedFields = new Set([
  'password',
  'is_available',
  'rating',
  'content_id',
  'skill_id',
  'session_id',
  'user_id',
  'reviewed_user_id',
  'limit',
]);

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (skippedFields.has(key)) continue;
      req.body[key] = sanitizeString(req.body[key]);
    }
  }
  next();
};

module.exports = sanitizeBody;
