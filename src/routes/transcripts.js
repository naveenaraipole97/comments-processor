const express = require('express');
const router = express.Router();
const { getAllTranscripts, getTranscriptSummary } = require('../controllers/transcriptsController');

// Define route
router.get('/summary/:transcriptId', getTranscriptSummary);
router.get('/', getAllTranscripts);

module.exports = router;
