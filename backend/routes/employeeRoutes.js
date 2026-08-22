const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Employee Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Admin Employee Directory routes
router.get('/', protect, adminOnly, getAllEmployees);
router.post('/', protect, adminOnly, addEmployee);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;
