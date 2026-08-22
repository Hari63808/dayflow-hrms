const express = require('express');
const router = express.Router();
const { getReviews, addReview } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getReviews);
router.post('/', protect, adminOnly, addReview);

module.exports = router;
