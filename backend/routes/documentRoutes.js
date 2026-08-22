const express = require('express');
const router = express.Router();
const { getDocuments, uploadDocumentRecord } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDocuments);
router.post('/', protect, uploadDocumentRecord);

module.exports = router;
