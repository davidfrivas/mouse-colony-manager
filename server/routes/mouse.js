const express = require("express");
const Mouse = require('../models/mouse'); // Access functions in Mouse model
const router = express.Router();


// Helper function to determine appropriate error status
function getErrorStatus(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('not found')) {
    return 404; // Not Found
  }
  if (message.includes('already exists') || message.includes('duplicate')) {
    return 409; // Conflict - resource already exists
  }
  if (message.includes('required') || message.includes('invalid') || message.includes('missing')) {
    return 400; // Bad Request - invalid input
  }
  
  return 500; // Internal Server Error - unexpected errors
}

// Create routes to access database
router
  // CREATE a new mouse
  .post('/create', async (req, res) => {
    try {
      const mouseData = req.body;

      // Input validation for required fields
      const { name, sex, genotype, strain, birthDate, labId, protocolId, userId } = mouseData;
      if (!name || !sex || !genotype || !strain || !birthDate || !labId || !protocolId || !userId) {
        return res.status(400).send({ 
          message: 'name, sex, genotype, strain, birthDate, labId, protocolId, and userId are required' 
        });
      }

      const mouse = await Mouse.createMouse(mouseData);

      res.status(201).send({
        message: 'Mouse created successfully',
        mouse: mouse
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // READ all mice created by a specific user
  .get('/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      // Input validation
      if (!userId) {
        return res.status(400).send({ message: 'User ID is required'});
      }

      const mice = await Mouse.getMiceByUser(userId);

      res.status(200).send({
        message: `Found ${mice.length} mice for user`,
        mice: mice
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // READ mouse info by name
  .get('/name/:name', async (req, res) => {
    try {
      const { name } = req.params;

      // Input validation
      if (!name) {
        return res.status(400).send({ message: 'Mouse name is required'});
      }

      const mouse = await Mouse.mouseInfo(name);

      if (!mouse) {
        return res.status(404).send({ message: 'Mouse not found' });
      }
      res.status(200).send({
        message: 'Mouse retrieved successfully',
        mouse: mouse
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // READ all mice for a specific lab
  .get('/lab/:labId', async (req, res) => {
    try {
      const { labId } = req.params;

      // Input validation
      if (!labId) {
        return res.status(400).send({ message: 'Lab ID is required'});
      }

      const mice = await Mouse.getMiceByLab(labId);

      res.status(200).send({
        message: `Found ${mice.length} mice in lab`,
        mice: mice
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // READ available mice for a specific lab
  .get('/lab/:labId/available', async (req, res) => {
    try {
      const { labId } = req.params;

      // Input validation
      if (!labId) {
        return res.status(400).send({ message: 'Lab ID is required'});
      }

      const availableMice = await Mouse.getAvailableMice(labId);

      res.status(200).send({
        message: `Found ${availableMice.length} mice in lab`,
        mice: availableMice
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // UPDATE mouse availability
  .put('/update-availability/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { availability } = req.body;

      // Input validation
      if (!id) {
        return res.status(400).send({ message: 'Mouse ID is required' });
      }
      if (typeof availability !== 'boolean') {
        return res.status(400).send({ message: 'Availability must be true or false' });
      }

      const updatedMouse = await Mouse.updateMouseAvailability(id, availability);

      if (!updatedMouse) {
        return res.status(404).send({ message: 'Mouse not found' });
      }

      res.status(200).send({
        message: 'Mouse availability updated successfully',
        mouse: updatedMouse
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  .put('/update-notes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      // Input validation
      if (!id) {
        return res.status(400).send({ message: 'Mouse ID is required' });
      }
      if (!notes) {
        return res.status(400).send({ message: 'Notes are required' });
      }

      const updatedMouse = await Mouse.updateMouseNotes(id, notes);

      if (!updatedMouse) {
        return res.status(404).send({ message: 'Mouse not found' });
      }

      res.status(200).send({
        message: 'Mouse notes updated successfully',
        mouse: updatedMouse
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  })

  // DELETE a mouse
  .delete('/delete/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Input validation
      if (!id) {
        return res.status(400).send({ message: 'Mouse ID is required' });
      }

      const deleted = await Mouse.deleteMouse(id);

      if (!deleted) {
        return res.status(404).send({ message: 'Mouse not found' });
      }

      res.status(200).send({
        message: 'Mouse deleted successfully'
      });
    }
    catch(error) {
      const status = getErrorStatus(error);
      res.status(status).send({ message: error.message });
    }
  });

// Export router for index.js
module.exports = router;