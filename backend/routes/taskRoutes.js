const express = require('express');
const router = express.Router();
const { getTasks, addTask, updateTaskStatus } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.post('/', protect, adminOnly, addTask);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;
