require("dotenv").config(); // Load environment variables

// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const userRoutes = require('./server/routes/user');
const logEntryRoutes = require('./server/routes/log-entry');

mongoose.connect(process.env.dbURL)
  .then(() => console.log("DB Connected!"))
  .catch(error => console.log("MongoDB connection error:", error));

const app = express(); // Create instance of Express app

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

// Serve the index.html file on the root path
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.use('/user', userRoutes);
app.use('/log-entry', logEntryRoutes);

// Start the server on specified port (default: 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
