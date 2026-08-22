const express = require('express');
const router = express.Router();
const { getHRReports } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getHRReports);

module.exports = router;
