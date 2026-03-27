// reportRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController');

router.post('/', verifyToken, createReport);
router.get('/', verifyToken, getReports);
router.put('/:report_id/status', verifyToken, updateReportStatus);

module.exports = router;
