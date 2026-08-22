const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, adminOnly, employeeOnly } = require('../middleware/authMiddleware');

router.post('/', protect, employeeOnly, applyLeave);
router.get('/my', protect, employeeOnly, getMyLeaves);

// Admin routes
router.get('/', protect, adminOnly, getAllLeaves);
router.put('/:id/status', protect, adminOnly, updateLeaveStatus);

module.exports = router;
