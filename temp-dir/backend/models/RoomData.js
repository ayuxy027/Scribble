const mongoose = require('mongoose');

// Schema for individual room data (canvas history, messages, etc.)
const RoomDataSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { 
    type: String, 
    enum: ['canvas', 'message', 'game_event'], 
    required: true 
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  userId: { type: String },
  username: { type: String }
}, { timestamps: true });

// Function to get room-specific collection
function getRoomDataModel(roomId) {
  const collectionName = `room_${roomId.toLowerCase()}`;
  
  // Check if model already exists
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  
  // Create new model for this room
  return mongoose.model(collectionName, RoomDataSchema, collectionName);
}

module.exports = { getRoomDataModel, RoomDataSchema };
