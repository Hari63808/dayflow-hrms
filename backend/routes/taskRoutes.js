const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  getMyTasks, 
  addTask, 
  updateTaskStatus 
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.get('/my', protect, getMyTasks);
router.post('/', protect, adminOnly, addTask);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;
