const express = require('express');
const router = express.Router();
const { getTranscriptSummary } = require('../controllers/transcriptsController');

// Define route
router.get('/summary/:transcriptId', getTranscriptSummary);

module.exports = router;
