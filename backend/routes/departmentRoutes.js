const express = require('express');
const router = express.Router();
const { getDepartments, addDepartment } = require('../controllers/departmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getDepartments);
router.post('/', protect, adminOnly, addDepartment);

module.exports = router;
