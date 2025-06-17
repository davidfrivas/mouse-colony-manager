const express = require("express");
const User = require('../models/log-entry') // Access functions in LogEntry model
const router = express.Router();

// Helper function to determine appropriate error status
function getErrorStatus(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('not found')) {
    return 404; // Not Found
  }
  if (message.includes('required') || message.includes('invalid')) {
    return 400; // Bad Request - invalid input
  }
  
  return 500; // Internal Server Error - unexpected errors
}

// Create routes to access database
router
  // CREATE/Post a log entry
  .post('/create', async (req, res) => {
    try {
      const { userId, labId, mice, content } = req.body;
      
      // Input validation
      if (!userId || !labId || !mice || !content) {
        return res.status(400).send({ 
          message: 'userId, labId, mice, and content are required' 
        });
      }
      
      const logEntry = await LogEntry.postLogEntry(userId, labId, mice, content);
      
      res.status(201).send({
        message: 'Log entry created successfully',
        logEntry: logEntry
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // READ a single log entry by ID
  .get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).send({ message: 'Log entry ID is required' });
      }
      
      const logEntry = await LogEntry.readLogEntry(id);
      
      res.status(200).send({
        message: 'Log entry retrieved successfully',
        logEntry: logEntry
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })
 
  // READ all log entries for a specific mouse
  .get('/mouse/:mouseId', async (req, res) => {
    try {
      const { mouseId } = req.params;
      
      if (!mouseId) {
        return res.status(400).send({ message: 'Mouse ID is required' });
      }
      
      const logEntries = await LogEntry.readLogEntries(mouseId);
      
      res.status(200).send({
        message: `Found ${logEntries.length} log entries for mouse`,
        logEntries: logEntries
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // READ all log entries for a specific lab
  .get('/lab/:labId', async (req, res) => {
    try {
      const { labId } = req.params;
      
      if (!labId) {
        return res.status(400).send({ message: 'Lab ID is required' });
      }
      
      const logEntries = await LogEntry.readLogEntriesByLab(labId);
      
      res.status(200).send({
        message: `Found ${logEntries.length} log entries for lab`,
        logEntries: logEntries
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // READ all log entries for a specific user
  .get('/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).send({ message: 'User ID is required' });
      }
      
      const logEntries = await LogEntry.readLogEntriesByUser(userId);
      
      res.status(200).send({
        message: `Found ${logEntries.length} log entries by user`,
        logEntries: logEntries
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // UPDATE a log entry
  .put('/update/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      // Input validation
      if (!id) {
        return res.status(400).send({ message: 'Log entry ID is required' });
      }
      if (!content) {
        return res.status(400).send({ message: 'Content is required' });
      }
      
      const updatedLogEntry = await LogEntry.updateLogEntry(id, content);
      
      res.status(200).send({
        message: 'Log entry updated successfully',
        logEntry: updatedLogEntry
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // DELETE a log entry
  .delete('/delete/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).send({ message: 'Log entry ID is required' });
      }
      
      const deleted = await LogEntry.deleteLogEntry(id);
      
      if (!deleted) {
        return res.status(404).send({ message: 'Log entry not found' });
      }
      
      res.status(200).send({
        message: 'Log entry deleted successfully'
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  });

// Export router
module.exports = router;