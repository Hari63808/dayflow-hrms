const express = require('express');
const router = express.Router();
const { getHolidays, addHoliday } = require('../controllers/holidayController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getHolidays);
router.post('/', protect, adminOnly, addHoliday);

module.exports = router;
