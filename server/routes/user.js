const express = require("express");
const User = require('../models/user'); // Access functions in User model
const router = express.Router();

// Helper function to safely return user without password
function sanitizeUser(user) {
  const userObj = user.toObject ? user.toObject() : user;
  const { password, ...safeUser } = userObj;
  return safeUser;
}

// Helper function to determine appropriate error status
function getErrorStatus(error) {
  const message = error.message.toLowerCase();

  if (message.includes('user not found') || message.includes('wrong password')) {
    return 401; // Unauthorized - authentication failed
  }
  if (message.includes('already in use') || message.includes('duplicate')) {
    return 409; // Conflict - resource already exists
  }
  if (message.includes('required') || message.includes('validation')) {
    return 400; // Bad request - invalid input
  }

  return 500; // Internal server error - unexpected errors
}

// Create routes to access database
router
  // READ/LOGIN a user
  .post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Input validation
      if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
      }

      const user = await User.login(username, password);
      res.status(200).send({
        message: 'Login successful',
        user: sanitizeUser(user)
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message })
    }
  })

  // CREATE/Register a user
  .post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Input validation
      if (!username || !email || !password) {
        return res.status(400).send({ message: 'Username, email, and password are required' });
      }
      const user = await User.register(username, email, password);
      res.status(201).send({
        message: 'User registered successfully',
        user: sanitizeUser(user)
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // UPDATE password
  .put('/update-password', async (req, res) => {
    try {
      const { id, password } = req.body;

      // Input validation
      if (!id || !password) {
        return res.status(400).send({ message: 'User ID and new password are required'});
      }

      const user = await User.updatePassword(id, password);

      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.status(200).send({
        message: 'Password updated successfully',
        user: sanitizeUser(user)
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // DELETE a user
  .delete('/delete/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Input validation
      if (!id) {
        return res.status(400).send({ message: 'User ID is required' });
      }

      const deleted = await User.deleteUser(id);

      if (!deleted) {
        return res.status(404).send({ message: 'User not found' });
      }

      res.status(200).send({
        message: 'User deleted successfully'
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  });

// Export router for index.js
module.exports = router;