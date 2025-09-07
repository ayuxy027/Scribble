const mongoose = require('mongoose');

// This defines the structure for a user inside a room's user list.
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true }, // The user's socket.id
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
});

// This is the main blueprint for a game room.
const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  hostId: { type: String, required: true },
  locked: { type: Boolean, default: false },
  users: [UserSchema],
  canvasHistory: { type: Array, default: [] },
  gameState: { type: String, default: 'lobby' },
  currentRound: { type: Number, default: 0 },
  currentDrawerId: { type: String, default: null },
  currentWord: { type: String, default: '' },
  turnOrder: [String],
  isWordGuessed: { type: Boolean, default: false },
  correctGuessers: [String],
  startTime: { type: Date, default: null },
  roundEndTime: { type: Date, default: null },
  availableWords: { type: Array, default: [] },
  // New fields for round phases
  roundPhase: { type: String, default: 'lobby' }, // 'choose-word', 'drawing', 'results'
  roundStartTime: { type: Date, default: null },
  phaseEndTime: { type: Date, default: null },
  roundScores: { type: Array, default: [] }, // Store scores gained this round
  tempWordOptions: { type: Array, default: [] }, // Temporary storage for word options
  readyPlayers: { type: Array, default: [] }, // Track ready players for restart
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
