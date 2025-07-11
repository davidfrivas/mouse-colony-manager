const mongoose = require("mongoose"); // Import mongoose

// ========== ERROR CONSTANTS ==========
const ERRORS = {
  MOUSE_EXISTS: "Mouse already exists",
  MOUSE_NOT_FOUND: "Mouse not found",
  MISSING_FIELDS: "All required fields must be provided",
  INVALID_ID: "Invalid ID provided"
};

// ========== SCHEMA & MODEL ==========
// Create schema for entity
const mouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sex: { type: String, enum: ['male', 'female'], required: true },
  genotype: [{ type: String, required: true }],
  strain: { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  availability: { type: Boolean, default: true, required: true },
  notes: { type: String, trim: true },
  // Make these optional for now
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: false, default: null },
  protocolId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchProtocol', required: false, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  motherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mouse', default: null },
  fatherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mouse', default: null },
  littermates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mouse', default: null }],
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
mouseSchema.index({ name: 1, labId: 1 });
mouseSchema.index({ labId: 1, availability: 1 });
mouseSchema.index({ protocolId: 1 });
mouseSchema.index({ userId: 1 });

const Mouse = mongoose.model("Mouse", mouseSchema);

// ========== HELPER FUNCTIONS ==========
function validateObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getMouse(name) {
  return await Mouse.findOne({ "name": name });
}

// ========== CRUD OPERATIONS ==========

// CREATE a mouse
async function createMouse(mouseData) {
  const {
    name, sex, genotype, strain, birthDate, availability = true, notes, 
    labId = null, protocolId = null, userId, motherId = null, fatherId = null, littermates = []
  } = mouseData;
  
  // Input validation for required fields only
  if (!name || !sex || !genotype || !strain || !birthDate || !userId) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  // Check for existing mouse by name (remove labId constraint for now)
  const existingMouse = await Mouse.findOne({ name });
  if (existingMouse) {
    throw new Error(ERRORS.MOUSE_EXISTS);
  }

  // Validate required ObjectIds
  if (!validateObjectId(userId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  // Validate optional ObjectIds only if provided
  if ((labId && !validateObjectId(labId)) || 
      (protocolId && !validateObjectId(protocolId)) ||
      (motherId && !validateObjectId(motherId)) || 
      (fatherId && !validateObjectId(fatherId))) {
    throw new Error(ERRORS.INVALID_ID);
  }

  // Ensure littermates is an array and validate each ID
  const littermatesArray = Array.isArray(littermates) ? littermates : [];
  for (const mouseId of littermatesArray) {
    if (mouseId && !validateObjectId(mouseId)) {
      throw new Error(ERRORS.INVALID_ID);
    }
  }

  // Create and return new mouse
  return await Mouse.create({
    name: name.trim(),
    sex,
    genotype: Array.isArray(genotype) ? genotype : [genotype],
    strain: strain.trim(),
    birthDate,
    availability,
    notes: notes ? notes.trim() : null,
    labId: labId || null,
    protocolId: protocolId || null,
    userId,
    motherId: motherId || null,
    fatherId: fatherId || null,
    littermates: littermatesArray.filter(id => id)
  });
}

// READ mouse info by name
async function mouseInfo(name) {
  if (!name) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  const mouse = await Mouse.findOne({ name })
    .populate('userId', 'username email')
    .populate('motherId', 'name')
    .populate('fatherId', 'name')
    .populate('littermates', 'name');

  if (!mouse) {
    throw new Error(ERRORS.MOUSE_NOT_FOUND);
  }

  return mouse;
}

// READ all mice for a lab
async function getMiceByLab(labId) {
  if (!labId || !validateObjectId(labId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  return await Mouse.find({ labId })
    .populate('userId', 'username')
    .sort({ name: 1 });
}

// READ all mice created by a specific user
async function getMiceByUser(userId) {
  if (!userId || !validateObjectId(userId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  return await Mouse.find({ userId })
    .populate('userId', 'username email')
    .populate('motherId', 'name')
    .populate('fatherId', 'name')
    .populate('littermates', 'name')
    .sort({ createdAt: -1 });
}

// READ available mice for a lab
async function getAvailableMice(labId) {
  if (!labId || !validateObjectId(labId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  return await Mouse.find({ labId, availability: true })
    .populate('userId', 'username')
    .sort({ name: 1 });
}

// UPDATE mouse availability
async function updateMouseAvailability(mouseId, availability) {
  if (!mouseId || typeof availability !== 'boolean') {
    throw new Error(ERRORS.MISSING_FIELDS);
  }
  
  if (!validateObjectId(mouseId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  return await Mouse.findByIdAndUpdate(
    mouseId,
    { availability },
    { new: true, runValidators: true }
  );
}

// UPDATE mouse notes
async function updateMouseNotes(mouseId, notes) {
  if (!mouseId || !notes) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }
  
  if (!validateObjectId(mouseId)) {
    throw new Error(ERRORS.INVALID_ID);
  }
  
  return await Mouse.findByIdAndUpdate(
    mouseId,
    { notes: notes.trim() },
    { new: true, runValidators: true }
  );
}

// DELETE a mouse
async function deleteMouse(mouseId) {
  if (!mouseId) {
    throw new Error(ERRORS.MISSING_FIELDS);
  }

  if (!validateObjectId(mouseId)) {
    throw new Error(ERRORS.INVALID_ID);
  }

  const result = await Mouse.deleteOne({ "_id": mouseId });
  return result.deletedCount > 0;
}

// Export all functions for routes
module.exports = { 
  createMouse, 
  mouseInfo,
  getMouse, 
  getMiceByLab,
  getMiceByUser,
  getAvailableMice,
  updateMouseAvailability, 
  updateMouseNotes,
  deleteMouse 
};