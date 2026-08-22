const express = require('express');
const router = express.Router();
const { getCorrections, requestCorrection, reviewCorrection } = require('../controllers/correctionController');
const { protect, adminOnly, employeeOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getCorrections);
router.post('/', protect, employeeOnly, requestCorrection);
router.put('/:id/review', protect, adminOnly, reviewCorrection);

module.exports = router;
