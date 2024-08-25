// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Debugging: Log the API key
console.log("API Key:", process.env.OPENAI_API_KEY);


const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");

//Allow CORS
const cors = require('cors');

// Initialize Express app
const app = express();

app.use(cors({
    origin: 'https://rilla-hackathon.vercel.app/', // Allow requests from this origin
}));


app.use(bodyParser.json());

// Import routes
const commentsRoutes = require("./routes/comments");
const transcriptsRoutes = require("./routes/transcripts");

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

app.use("/comments", commentsRoutes);
app.use("/transcripts", transcriptsRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

module.exports.handler = serverless(app);
