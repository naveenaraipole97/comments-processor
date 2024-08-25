const express = require('express');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Import routes
const commentsRoutes = require('./routes/comments');
const transcriptsRoutes = require('./routes/transcripts');

// Use routes
app.use('/comments', commentsRoutes);
app.use('/transcripts', transcriptsRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
