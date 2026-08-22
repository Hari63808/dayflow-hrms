const express = require('express');
const router = express.Router();
const { getAdminStats, getEmployeeStats } = require('../controllers/dashboardController');
const { protect, adminOnly, employeeOnly } = require('../middleware/authMiddleware');

router.get('/admin', protect, adminOnly, getAdminStats);
router.get('/employee', protect, employeeOnly, getEmployeeStats);

module.exports = router;
