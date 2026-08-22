const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayStatus,
  getAllAttendance
} = require('../controllers/attendanceController');
const { protect, adminOnly, employeeOnly } = require('../middleware/authMiddleware');

router.post('/check-in', protect, employeeOnly, checkIn);
router.post('/check-out', protect, employeeOnly, checkOut);
router.get('/my', protect, employeeOnly, getMyAttendance);
router.get('/today', protect, employeeOnly, getTodayStatus);

// Admin route
router.get('/', protect, adminOnly, getAllAttendance);

module.exports = router;
