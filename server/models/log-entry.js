const mongoose = require("mongoose"); // Import mongoose

// ========== ERROR CONSTANTS ==========
const ERRORS = {
  MISSING_FIELDS: "All required fields must be provided",
  ENTRY_NOT_FOUND: "Log entry not found",
  INVALID_ID: "Invalid ID provided"
};

// ========== SCHEMA & MODEL ==========
// Create schema for entity
const logEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  mice: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mice', required: true }],
  content: {type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
logEntrySchema.index({ userId: 1, createdAt: -1 });
logEntrySchema.index({ labId: 1, createdAt: -1 });
logEntrySchema.index({ mice: 1, createdAt: -1 });

const LogEntry = mongoose.model("LogEntry", logEntrySchema); // Create model of schema

// ========== HELPER FUNCTIONS ==========
function validateObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ========== CRUD OPERATIONS ==========

// CREATE/Post a log entry
async function postLogEntry(userId, labId, mice, content) {
  if (!userId || !labId || !mice || !content) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  // Validate ObjectIds
  if (!validateObjectId(userId) || !validateObjectId(labId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  // Ensure mice is an array and validate each ID
  const miceArray = Array.isArray(mice) ? mice : [mice];
  for (const mouseId of miceArray) {
    if (!validateObjectId(mouseId)) {
      throw new Error(ERRORS.INVALID_ID);
    }
  }

  return await LogEntry.create({
    userId,
    labId,
    mice: miceArray,
    content: content.trim()
  });
}

// READ a single log entry by ID
async function readLogEntry(entryId) {
  // Input validation
  if (!entryId) {
    throw new Error(ERRORS.INVALID_ID);
  }

  const entry = await LogEntry.findById(entryId)
    .populate('userId', 'username email')
    .populate('labId', 'name')
    .populate('mice', 'name strain');

  if (!entry) {
    throw new Error(ERRORS.ENTRY_NOT_FOUND);
  }

  return entry;
}

// READ all log entries for a specific mouse
async function readLogEntries(mouseId) {
  // Input validation
  if (!mouseId) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  if (!validateObjectId(mouseId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  return await LogEntry.find({ mice: mouseId })
    .populate('userId', 'username email')
    .populate('labId', 'name')
    .populate('mice', 'name strain')
    .sort({ createdAt: -1 }); // Most recent first
}

// READ all log entries for a lab
async function readLogEntriesByLab(labId) {
  // Input validation
  if (!labId) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  if (!validateObjectId(labId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  return await LogEntry.find({ labId })
    .populate('userId', 'username email')
    .populate('mice', 'name strain')
    .sort({ createdAt: -1 }); // Most recent first
}

// READ all log entries for a user
async function readLogEntriesByUser(userId) {
  // Input validation
  if (!userId) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  if (!validateObjectId(userId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  return await LogEntry.find({ userId })
    .populate('labId', 'name')
    .populate('mice', 'name strain')
    .sort({ createdAt: -1 }); // Most recent first
}

// UPDATE a log entry
async function updateLogEntry(entryId, content) {
  // Input validation
  if (!entryId || !content) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  if (!validateObjectId(entryId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  const updatedEntry = await LogEntry.findByIdAndUpdate(
    entryId,
    { content: content.trim() },
    { new: true, runValidators: true }
  ).populate('userId', 'username email')
   .populate('labId', 'name')
   .populate('mice', 'name strain');

  if (!updatedEntry) {
    throw new Error(ERRORS.ENTRY_NOT_FOUND);
  }

  return updatedEntry;
}

// DELETE a log entry
async function deleteLogEntry(entryId) {
  // Input validation
  if (!entryId) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  if (!validateObjectId(entryId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  const result = await LogEntry.deleteOne({ _id: entryId });
  return result.deletedCount > 0;
}


// Export all functions for routes
module.exports = {
  postLogEntry,
  readLogEntry,
  readLogEntries,
  readLogEntriesByLab,
  readLogEntriesByUser,
  updateLogEntry,
  deleteLogEntry
};