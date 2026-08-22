const express = require('express');
const router = express.Router();
const { 
  getDepartments, 
  addDepartment, 
  updateDepartment, 
  deleteDepartment 
} = require('../controllers/departmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getDepartments);
router.post('/', protect, adminOnly, addDepartment);
router.put('/:id', protect, adminOnly, updateDepartment);
router.delete('/:id', protect, adminOnly, deleteDepartment);

module.exports = router;
