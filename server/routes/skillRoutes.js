// skillRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  createSkill,
  getMySkills,
  updateSkill,
  deleteSkill,
  searchSkills,
} = require('../controllers/skillController');

router.post('/', verifyToken, createSkill);
router.get('/me', verifyToken, getMySkills);
router.get('/search', searchSkills);
router.put('/:skill_id', verifyToken, updateSkill);
router.delete('/:skill_id', verifyToken, deleteSkill);

module.exports = router;
