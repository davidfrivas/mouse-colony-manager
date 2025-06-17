const mongoose = require("mongoose"); // Import mongoose
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// ========== ERROR CONSTANTS ==========
const ERRORS = {
  USER_EXISTS: "Username or email already in use",
  USER_NOT_FOUND: "User not found",
  WRONG_PASSWORD: "Wrong password",
  MISSING_FIELDS: "All fields are required"
};

// ========== SCHEMA & MODEL ==========
// Create schema for entity
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true, minlength: 6},
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab' },
  role: { type: String, enum: ['principal investigator', 'research assistant', 'volunteer', 'user'], default: 'user'},
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema); // Create model of schema

// ========== HELPER FUNCTIONS ==========
async function getUser(username) {
  return await User.findOne({ "username": username });
};

// ========== CRUD OPERATIONS ==========

// CREATE/Register a user
async function register(username, email, password) {
  // Input validation
  if (!username || !email || !password) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  // Check for existing user by username or email
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existingUser) {
    throw new Error(ERRORS.USER_EXISTS);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create and return new user
  return await User.create({
    username,
    email,
    password: hashedPassword
  });
};

// READ/LOGIN a user
async function login(username, password) {
  // Input validation
  if (!username || !password) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  // Find user
  const user = await getUser(username);
  if (!user) {
    throw new Error(ERRORS.USER_NOT_FOUND);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error(ERRORS.WRONG_PASSWORD);
  }

  return user;
};

// UPDATE password
async function updatePassword(id, password) {
  // Input validation
  if (!id || !password) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Update and return updated user
  return await User.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { new: true }
  );
};

// DELETE a user
async function deleteUser(id) {
  // Input validation
  if (!id) {
    throw new Error("User ID is required");
  }

  const result = await User.deleteOne({ "_id": id });
  return result.deletedCount > 0;
};

// Export all functions for routes
module.exports = { register, login, updatePassword, deleteUser, getUser };