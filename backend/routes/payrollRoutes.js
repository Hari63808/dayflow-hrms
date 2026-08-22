const express = require('express');
const router = express.Router();
const {
  getMyPayroll,
  getAllPayroll,
  addPayroll,
  updatePayroll,
  deletePayroll
} = require('../controllers/payrollController');
const { protect, adminOnly, employeeOnly } = require('../middleware/authMiddleware');

router.get('/my', protect, employeeOnly, getMyPayroll);

// Admin routes
router.get('/', protect, adminOnly, getAllPayroll);
router.post('/', protect, adminOnly, addPayroll);
router.put('/:id', protect, adminOnly, updatePayroll);
router.delete('/:id', protect, adminOnly, deletePayroll);

module.exports = router;
