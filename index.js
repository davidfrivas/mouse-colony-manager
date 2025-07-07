require("dotenv").config(); // Load environment variables

// Import required modules
const express = require("express"); // Express web framework
const mongoose = require("mongoose"); // Mongoose Object Data Modeling library
const path = require("path"); // Node.js utility for handling file paths

// Import route handlers
const userRoutes = require('./server/routes/user');
const logEntryRoutes = require('./server/routes/log-entry');
const mouseRoutes = require('./server/routes/mouse');

// Connect to MongoDB using credentials from .env
mongoose.connect(process.env.dbURL)
  .then(() => console.log("DB Connected!"))
  .catch(error => console.log("MongoDB connection error:", error));

const app = express(); // Create instance of Express app

// Add logging middleware first
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS headers to allow requests from any origin
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Serve static files (CSS, JS, images, etc.) from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Add test route after middleware
app.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Server is working!' });
});

// Serve the index.html file when root URL is accessed
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// Add debug logging for routes
console.log("Setting up routes...");

// Use route handlers for /user and /log-entry paths
app.use('/user', userRoutes);
app.use('/log-entry', logEntryRoutes);
app.use('/mouse', mouseRoutes);

console.log("Routes set up complete");

// Start the server on specified port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));