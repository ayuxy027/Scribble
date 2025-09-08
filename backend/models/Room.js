const mongoose = require('mongoose');

// This defines the structure for a user inside a room's user list.
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true }, // The user's socket.id
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
  walletAddress: { type: String, default: null }, // Stacks wallet address
  staked: { type: Boolean, default: false }, // Whether user has staked for this game
  stakeTxId: { type: String, default: null }, // Transaction ID of the stake
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
  revealedChars: { type: Array, default: [] }, // Track revealed character positions
  
  // Web3 Integration Fields
  stakeAmount: { type: Number, default: 1000000 }, // Stake amount in microSTX (1 STX = 1,000,000 microSTX)
  contractGameId: { type: Number, default: null }, // Game ID in the smart contract
  contractAddress: { type: String, default: null }, // Smart contract address being used
  stakingPhase: { type: String, default: 'none' }, // 'pending', 'completed', 'failed', 'none'
  totalPot: { type: Number, default: 0 }, // Total staked amount
  winners: { type: Array, default: [] }, // Array of winner wallet addresses
  gameFinalized: { type: Boolean, default: false }, // Whether rewards have been distributed
  finalizeTxId: { type: String, default: null }, // Transaction ID of reward distribution
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
