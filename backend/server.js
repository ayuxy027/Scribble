const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const mongoose = require("mongoose")

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

const PORT = process.env.PORT || 4000

// MongoDB connection
const MONGO_URI =
  "mongodb+srv://batman:Muichiro_138@cluster0.5kumvas.mongodb.net/"

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("🔥 MongoDB connection error:", err))

// Import Room model and RoomData helper
const Room = require("./models/Room")
const { getRoomDataModel } = require("./models/RoomData")

const words = [
  "blockchain",
  "wallet",
  "mint",
  "ethereum",
  "server",
  "react",
  "moon",
  "diamond",
  "rocket",
  "developer",
]

async function emitRoomUpdate(roomId) {
  try {
    const room = await Room.findOne({ roomId })
    if (!room) return

    const userArray = room.users.map(({ username, score, id }) => ({
      username,
      score,
      id,
    }))
    io.in(roomId).emit("room-update", {
      roomId,
      users: userArray,
      hostId: room.hostId,
      locked: room.locked,
    })

    // Log room update to room-specific collection
    const RoomData = getRoomDataModel(roomId)
    await new RoomData({
      type: "game_event",
      data: { event: "room_update", users: userArray.length },
    }).save()
  } catch (error) {
    console.error("Error in emitRoomUpdate:", error)
  }
}

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)]
}

function getUniqueWord(room) {
  if (!room.availableWords || room.availableWords.length === 0) {
    room.availableWords = [...words]
  }
  const idx = Math.floor(Math.random() * room.availableWords.length)
  const word = room.availableWords.splice(idx, 1)[0]
  return word
}

async function startNextRound(roomId) {
  try {
    const room = await Room.findOne({ roomId })
    if (!room) return

    // Check if all players have drawn once - if so, show final results
    if (room.currentRound >= room.turnOrder.length) {
      await showFinalResults(roomId)
      return
    }

    // Reset round-specific state
    room.isWordGuessed = false
    room.correctGuessers = []
    room.roundScores = []
    room.currentWord = "" // Clear previous word

    // Get the player who will draw this round
    const currentPlayerIndex = room.currentRound
    const drawerId = room.turnOrder[currentPlayerIndex]

    // Ensure this player exists (check for disconnects)
    const drawerExists = room.users.find((user) => user.id === drawerId)
    if (!drawerExists) {
      console.log(
        `[Room ${roomId}] Player ${drawerId} not found, skipping to next`
      )
      room.currentRound++
      await room.save()
      return startNextRound(roomId)
    }

    room.currentDrawerId = drawerId
    room.gameState = "playing"
    room.roundPhase = "choose-word"
    room.roundStartTime = new Date()
    room.phaseEndTime = new Date(Date.now() + 5000) // 5 seconds to choose word
    room.canvasHistory = []

    // Generate word options
    const wordOptions = []
    for (let i = 0; i < 3; i++) {
      if (room.availableWords.length === 0) {
        room.availableWords = [...words]
      }
      const idx = Math.floor(Math.random() * room.availableWords.length)
      const word = room.availableWords.splice(idx, 1)[0]
      wordOptions.push(word)
    }

    // Store word options for potential auto-selection
    room.tempWordOptions = wordOptions
    await room.save()

    // Log the player choosing word
    const drawerName = drawerExists?.username || "Unknown"
    console.log(
      `[Room ${roomId}] Round ${room.currentRound + 1} of ${
        room.turnOrder.length
      }: ${drawerName} choosing from: [${wordOptions.join(", ")}]`
    )

    io.in(roomId).emit("canvas-cleared")

    // Tell everyone about the word choosing phase
    io.in(roomId).emit("choose-word-phase", {
      drawerId: room.currentDrawerId,
      drawerName: drawerName,
      round: room.currentRound + 1,
      totalRounds: room.turnOrder.length,
      time: 5,
    })

    // Send word options to the drawer
    io.to(room.currentDrawerId).emit("choose-word-options", wordOptions)

    // Set up auto-selection timer with proper cleanup
    const autoSelectTimer = setTimeout(async () => {
      try {
        console.log(
          `[Room ${roomId}] Auto-selection timer triggered for ${drawerName}`
        )

        const updatedRoom = await Room.findOne({ roomId })
        if (!updatedRoom) {
          console.log(`[Room ${roomId}] Room not found during auto-selection`)
          return
        }

        if (updatedRoom.roundPhase !== "choose-word") {
          console.log(
            `[Room ${roomId}] Phase changed, auto-selection cancelled`
          )
          return
        }

        if (updatedRoom.currentWord && updatedRoom.currentWord.length > 0) {
          console.log(
            `[Room ${roomId}] Word already chosen manually: "${updatedRoom.currentWord}"`
          )
          return
        }

        // Auto-select random word from the 3 options
        const randomIndex = Math.floor(Math.random() * wordOptions.length)
        const selectedWord = wordOptions[randomIndex]

        updatedRoom.currentWord = selectedWord
        await updatedRoom.save()

        console.log(
          `[Room ${roomId}] Auto-selected word: "${selectedWord}" for ${drawerName}`
        )

        // Notify the drawer about the auto-selected word
        io.to(updatedRoom.currentDrawerId).emit("word-auto-selected", {
          word: selectedWord,
          message: `Time's up! You're drawing: "${selectedWord}"`,
        })

        // Start the drawing phase immediately
        await startDrawingPhase(roomId)
      } catch (error) {
        console.error(`[Room ${roomId}] Error in auto-select timeout:`, error)
      }
    }, 5000)

    // Store timer reference for potential cleanup
    if (!global.roomTimers) global.roomTimers = {}
    if (!global.roomTimers[roomId]) global.roomTimers[roomId] = {}
    global.roomTimers[roomId].autoSelect = autoSelectTimer
  } catch (error) {
    console.error("Error in startNextRound:", error)
  }
}

async function startDrawingPhase(roomId) {
  try {
    const room = await Room.findOne({ roomId })
    if (!room) return

    room.roundPhase = "drawing"
    room.startTime = new Date()
    room.roundEndTime = new Date(Date.now() + 30000) // 30 seconds to draw
    room.phaseEndTime = room.roundEndTime
    room.revealedChars = [] // Track which characters have been revealed

    await room.save()

    console.log(
      `[Room ${roomId}] Drawing phase started. Word: "${room.currentWord}"`
    )

    // Create initial word hint (all underscores)
    const wordLength = room.currentWord.length
    const wordHint = "_".repeat(wordLength)

    // Tell everyone about the drawing phase with word hint
    io.in(roomId).emit("drawing-phase", {
      drawerId: room.currentDrawerId,
      round: room.currentRound + 1,
      totalRounds: room.turnOrder.length,
      time: 30,
      wordHint: wordHint,
      wordLength: wordLength,
    })

    // Tell the drawer what word to draw
    io.to(room.currentDrawerId).emit("your-turn", room.currentWord)

    // Set up hint reveals at 10 and 20 seconds
    setTimeout(async () => {
      await revealRandomCharacter(roomId, 1) // First hint after 10 seconds
    }, 10000)

    setTimeout(async () => {
      await revealRandomCharacter(roomId, 2) // Second hint after 20 seconds
    }, 20000)

    // Drawing timer (30 seconds)
    setTimeout(async () => {
      try {
        const updatedRoom = await Room.findOne({ roomId })
        if (!updatedRoom || updatedRoom.roundPhase !== "drawing") return

        // Time's up - reveal word and show results
        io.in(roomId).emit(
          "system-message",
          `Time's up! The word was: ${updatedRoom.currentWord}`
        )
        io.in(roomId).emit("word-revealed", { word: updatedRoom.currentWord })

        updatedRoom.isWordGuessed = true
        await updatedRoom.save()

        await showRoundResults(roomId)
      } catch (error) {
        console.error("Error in drawing timeout:", error)
      }
    }, 30000)
  } catch (error) {
    console.error("Error in startDrawingPhase:", error)
  }
}

async function revealRandomCharacter(roomId, hintNumber) {
  try {
    const room = await Room.findOne({ roomId })
    if (!room || room.roundPhase !== "drawing" || room.isWordGuessed) return

    const word = room.currentWord.toLowerCase()
    const availablePositions = []

    // Find positions that haven't been revealed yet and aren't spaces
    for (let i = 0; i < word.length; i++) {
      if (!room.revealedChars.includes(i) && word[i] !== " ") {
        availablePositions.push(i)
      }
    }

    if (availablePositions.length === 0) return // No more characters to reveal

    // Pick a random position to reveal
    const randomIndex = Math.floor(Math.random() * availablePositions.length)
    const positionToReveal = availablePositions[randomIndex]

    room.revealedChars.push(positionToReveal)
    await room.save()

    // Create the updated hint
    let wordHint = ""
    for (let i = 0; i < word.length; i++) {
      if (room.revealedChars.includes(i)) {
        wordHint += room.currentWord[i] // Show the actual character
      } else if (word[i] === " ") {
        wordHint += " " // Always show spaces
      } else {
        wordHint += "_" // Keep as underscore
      }
    }

    // Send hint update to all players except the drawer
    const hintData = {
      wordHint: wordHint,
      hintNumber: hintNumber,
      revealedChar: room.currentWord[positionToReveal],
      position: positionToReveal,
    }

    // Send to everyone except the drawer
    room.users.forEach((user) => {
      if (user.id !== room.currentDrawerId) {
        io.to(user.id).emit("word-hint-update", hintData)
      }
    })

    console.log(
      `[Room ${roomId}] Hint ${hintNumber}: Revealed character '${room.currentWord[positionToReveal]}' at position ${positionToReveal}. Hint: "${wordHint}"`
    )
  } catch (error) {
    console.error("Error in revealRandomCharacter:", error)
  }
}

async function showRoundResults(roomId) {
  try {
    const room = await Room.findOne({ roomId })
    if (!room) return

    room.roundPhase = "results"
    room.phaseEndTime = new Date(Date.now() + 5000) // 5 seconds to show results

    await room.save()

    // Calculate and show round results
    const roundResults = room.roundScores.map((score) => ({
      username:
        room.users.find((u) => u.id === score.userId)?.username || "Unknown",
      points: score.points,
      reason: score.reason,
    }))

    io.in(roomId).emit("round-results", {
      round: room.currentRound + 1,
      results: roundResults,
      word: room.currentWord,
      time: 5,
    })

    // Move to next round after 5 seconds
    setTimeout(async () => {
      const updatedRoom = await Room.findOne({ roomId })
      if (!updatedRoom) return

      updatedRoom.currentRound++
      await updatedRoom.save()

      startNextRound(roomId)
    }, 5000)
  } catch (error) {
    console.error("Error in showRoundResults:", error)
  }
}

async function showFinalResults(roomId) {
  try {
    const room = await Room.findOne({ roomId })
    if (!room) return

    room.gameState = "final-results"
    room.roundPhase = "final-results"
    room.phaseEndTime = new Date(Date.now() + 10000) // 10 seconds to show final results

    await room.save()

    // Calculate final standings
    const finalScores = room.users
      .map(({ username, score }) => ({ username, score }))
      .sort((a, b) => b.score - a.score)

    // Log final results
    const RoomData = getRoomDataModel(roomId)
    await new RoomData({
      type: "game_event",
      data: {
        event: "final_results",
        scores: finalScores,
        totalRounds: room.turnOrder.length,
      },
    }).save()

    io.in(roomId).emit("final-results", {
      scores: finalScores,
      totalRounds: room.turnOrder.length,
      time: 10,
    })

    console.log(
      `[Room ${roomId}] Final results shown. Winner: ${finalScores[0]?.username}`
    )

    // Transition to game over after 10 seconds
    setTimeout(async () => {
      await endGame(roomId)
    }, 10000)
  } catch (error) {
    console.error("Error in showFinalResults:", error)
  }
}

async function endGame(roomId) {
  try {
    const room = await Room.findOne({ roomId })
    if (!room) return

    room.gameState = "game-over"
    room.roundPhase = null

    await room.save()

    const finalScores = room.users
      .map(({ username, score }) => ({ username, score }))
      .sort((a, b) => b.score - a.score)

    // Log game completion
    const RoomData = getRoomDataModel(roomId)
    await new RoomData({
      type: "game_event",
      data: {
        event: "game_ended",
        scores: finalScores,
        winner: finalScores[0]?.username,
      },
    }).save()

    io.in(roomId).emit("game-over", finalScores)
    console.log(
      `[Room ${roomId}] Game ended. Winner: ${finalScores[0]?.username}`
    )
  } catch (error) {
    console.error("Error in endGame:", error)
  }
}

async function resetGameState(roomId) {
  try {
    const room = await Room.findOne({ roomId })
    if (!room) return

    // Reset all game-related state
    room.locked = false
    room.gameState = "lobby"
    room.roundPhase = null
    room.currentRound = 0
    room.currentDrawerId = null
    room.currentWord = ""
    room.turnOrder = []
    room.isWordGuessed = false
    room.correctGuessers = []
    room.startTime = null
    room.roundEndTime = null
    room.phaseEndTime = null
    room.availableWords = [...words]
    room.canvasHistory = []
    room.roundScores = []
    room.tempWordOptions = []
    room.readyPlayers = [] // Reset ready status

    // Reset all user scores
    room.users.forEach((user) => (user.score = 0))

    await room.save()
    console.log(`[Room ${roomId}] Game state reset for new game`)
  } catch (error) {
    console.error("Error in resetGameState:", error)
  }
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // --- RECONNECT SUPPORT ---
  socket.on("reconnect-room", async (roomId, username) => {
    try {
      const room = await Room.findOne({ roomId })
      if (!room) return socket.emit("error", "Room not found")

      // Find user by username
      const userIndex = room.users.findIndex((u) => u.username === username)
      if (userIndex !== -1) {
        const oldSocketId = room.users[userIndex].id
        const wasHost = room.hostId === oldSocketId
        const wasCurrentDrawer = room.currentDrawerId === oldSocketId

        // Update user's socket ID
        room.users[userIndex].id = socket.id

        // Preserve host status
        if (wasHost) {
          room.hostId = socket.id
        }

        // Preserve drawer status and update turn order
        if (wasCurrentDrawer) {
          room.currentDrawerId = socket.id
          const turnIndex = room.turnOrder.findIndex((id) => id === oldSocketId)
          if (turnIndex !== -1) {
            room.turnOrder[turnIndex] = socket.id
          }
        } else {
          const turnIndex = room.turnOrder.findIndex((id) => id === oldSocketId)
          if (turnIndex !== -1) {
            room.turnOrder[turnIndex] = socket.id
          }
        }

        await room.save()
        socket.join(roomId)
        await emitRoomUpdate(roomId)
        socket.emit("canvas-state", room.canvasHistory)

        // Send complete chat history with timestamps (all messages from current game)
        const RoomData = getRoomDataModel(roomId)
        const chatHistory = await RoomData.find({
          type: "message",
          $or: [
            { "data.isGuess": false }, // Non-guess messages
            { "data.isGuess": true }, // Include guess messages for history completeness
          ],
        })
          .sort({ createdAt: 1 })
          .limit(100) // Last 100 messages for complete game history
          .lean()

        const formattedHistory = chatHistory.map((msg) => ({
          username: msg.username,
          message: msg.data.isGuess
            ? `[Guessed: ${msg.data.word}]`
            : msg.data.message,
          timestamp: msg.data.timestamp || msg.createdAt,
          isGuess: msg.data.isGuess,
        }))

        socket.emit("chat-history", formattedHistory)

        // Send current phase state
        if (room.gameState === "playing") {
          let remainingTime = 0

          if (room.phaseEndTime) {
            const now = new Date()
            remainingTime = Math.max(
              0,
              Math.ceil((room.phaseEndTime.getTime() - now.getTime()) / 1000)
            )
          }

          if (room.roundPhase === "choose-word") {
            socket.emit("choose-word-phase", {
              drawerId: room.currentDrawerId,
              drawerName: room.users.find((u) => u.id === room.currentDrawerId)
                ?.username,
              round: room.currentRound + 1,
              totalRounds: room.turnOrder.length,
              time: remainingTime,
            })

            if (room.currentDrawerId === socket.id && room.tempWordOptions) {
              socket.emit("choose-word-options", room.tempWordOptions)
            }
          } else if (room.roundPhase === "drawing") {
            socket.emit("drawing-phase", {
              drawerId: room.currentDrawerId,
              round: room.currentRound + 1,
              totalRounds: room.turnOrder.length,
              time: remainingTime,
            })

            if (room.isWordGuessed) {
              socket.emit("word-revealed", { word: room.currentWord })
            }

            if (room.currentDrawerId === socket.id) {
              socket.emit("your-turn", room.currentWord)
            }

            // If user had already guessed correctly, show them the word
            if (room.correctGuessers.includes(socket.id)) {
              socket.emit("correct-guess-private", {
                word: room.currentWord,
                points: 0, // Don't show points again
                message: `You already guessed "${room.currentWord}" correctly!`,
              })
            }
          } else if (room.roundPhase === "results") {
            const roundResults = room.roundScores.map((score) => ({
              username:
                room.users.find((u) => u.id === score.userId)?.username ||
                "Unknown",
              points: score.points,
              reason: score.reason,
            }))

            socket.emit("round-results", {
              round: room.currentRound + 1,
              results: roundResults,
              word: room.currentWord,
              time: remainingTime,
            })
          }
        } else if (room.gameState === "final-results") {
          const finalScores = room.users
            .map(({ username, score }) => ({ username, score }))
            .sort((a, b) => b.score - a.score)

          let remainingTime = 0
          if (room.phaseEndTime) {
            const now = new Date()
            remainingTime = Math.max(
              0,
              Math.ceil((room.phaseEndTime.getTime() - now.getTime()) / 1000)
            )
          }

          socket.emit("final-results", {
            scores: finalScores,
            totalRounds: room.turnOrder.length,
            time: remainingTime,
          })
        } else if (room.gameState === "game-over") {
          const finalScores = room.users
            .map(({ username, score }) => ({ username, score }))
            .sort((a, b) => b.score - a.score)
          socket.emit("game-over", finalScores)
        }

        console.log(
          `[Room ${roomId}] ${username} reconnected with new socket ${socket.id}`
        )
      }
    } catch (error) {
      console.error("Error in reconnect-room:", error)
      socket.emit("error", "Failed to reconnect to room")
    }
  })

  socket.on("create-room", async (username) => {
    try {
      let roomId
      let roomExists

      // Generate unique room ID
      do {
        roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
        roomExists = await Room.findOne({ roomId })
      } while (roomExists)

      const newRoom = new Room({
        roomId,
        hostId: socket.id,
        locked: false,
        users: [{ id: socket.id, username, score: 0 }],
        canvasHistory: [],
        gameState: "lobby",
        currentRound: 0,
        currentDrawerId: null,
        currentWord: "",
        turnOrder: [],
        isWordGuessed: false,
        correctGuessers: [],
        startTime: null,
        availableWords: [...words],
      })

      await newRoom.save()
      socket.join(roomId)

      // Create room-specific collection and log creation
      const RoomData = getRoomDataModel(roomId)
      await new RoomData({
        type: "game_event",
        data: { event: "room_created", creator: username },
        userId: socket.id,
        username,
      }).save()

      await emitRoomUpdate(roomId)
      console.log(
        `[Room ${roomId}] Created by ${username} with collection room_${roomId.toLowerCase()}`
      )
    } catch (error) {
      console.error("Error creating room:", error)
      socket.emit("error", "Failed to create room")
    }
  })

  socket.on("join-room", async (roomId, username) => {
    try {
      const room = await Room.findOne({ roomId })
      if (!room) return socket.emit("error", "Room not found")
      if (room.locked) return socket.emit("error", "Game has already started")

      // Check if user already exists
      const existingUser = room.users.find((u) => u.username === username)
      if (existingUser) {
        return socket.emit("error", "Username already taken in this room")
      }

      room.users.push({ id: socket.id, username, score: 0 })
      await room.save()

      socket.join(roomId)
      await emitRoomUpdate(roomId)
      socket.emit("canvas-state", room.canvasHistory)
      console.log(`[Room ${roomId}] ${username} joined`)
    } catch (error) {
      console.error("Error joining room:", error)
      socket.emit("error", "Failed to join room")
    }
  })

  socket.on("start-game", async (roomId) => {
    try {
      const room = await Room.findOne({ roomId })
      if (!room) return socket.emit("error", "Room not found")
      if (room.hostId !== socket.id)
        return socket.emit("error", "Only host can start game")
      if (room.users.length < 2)
        return socket.emit("error", "You need at least 2 players to start.")

      room.locked = true

      // Create the turn order: host first, then others in random order
      const otherPlayers = room.users
        .filter((user) => user.id !== room.hostId)
        .map((user) => user.id)
      const shuffledPlayers = otherPlayers.sort(() => Math.random() - 0.5)
      room.turnOrder = [room.hostId, ...shuffledPlayers]

      // Reset game state
      room.users.forEach((user) => (user.score = 0))
      room.currentRound = 0
      room.availableWords = [...words]

      await room.save()

      const playerNames = room.turnOrder
        .map((id) => {
          const user = room.users.find((u) => u.id === id)
          return user?.username || "Unknown"
        })
        .join(", ")
      console.log(
        `[Room ${roomId}] Game starting with ${room.turnOrder.length} players. Turn order: ${playerNames}`
      )

      await emitRoomUpdate(roomId)
      startNextRound(roomId)
    } catch (error) {
      console.error("Error starting game:", error)
      socket.emit("error", "Failed to start game")
    }
  })

  socket.on("start-new-game", async (roomId) => {
    try {
      const room = await Room.findOne({ roomId })
      if (!room) return socket.emit("error", "Room not found")
      if (room.hostId !== socket.id)
        return socket.emit("error", "Only the host can start a new game")
      if (room.users.length < 2)
        return socket.emit("error", "You need at least 2 players to start.")

      // Check if all players are ready
      const totalPlayers = room.users.length
      const readyPlayers = room.readyPlayers ? room.readyPlayers.length : 0

      if (readyPlayers < totalPlayers - 1) {
        // All players except host should be ready
        return socket.emit(
          "error",
          `Not all players are ready. ${readyPlayers}/${
            totalPlayers - 1
          } players ready.`
        )
      }

      await resetGameState(roomId)
      io.in(roomId).emit("canvas-cleared")
      io.in(roomId).emit("new-game-started")
      await emitRoomUpdate(roomId)

      console.log(
        `[Room ${roomId}] New game started by host with all players ready`
      )
    } catch (error) {
      console.error("Error starting new game:", error)
      socket.emit("error", "Failed to start new game")
    }
  })

  socket.on("join-new-game", async (roomId) => {
    try {
      const room = await Room.findOne({ roomId })
      if (!room) return socket.emit("error", "Room not found")
      if (room.gameState !== "game-over")
        return socket.emit("error", "Game is not over yet")

      const user = room.users.find((u) => u.id === socket.id)
      if (!user) return socket.emit("error", "User not found in room")

      // Add user to ready list if not already ready
      if (!room.readyPlayers) room.readyPlayers = []
      if (!room.readyPlayers.includes(socket.id)) {
        room.readyPlayers.push(socket.id)
        await room.save()
      }

      socket.emit("joined-new-game")

      // Emit ready status update to all players
      const totalPlayers = room.users.length
      const readyCount = room.readyPlayers.length
      const readyPlayerNames = room.readyPlayers.map(
        (id) => room.users.find((u) => u.id === id)?.username || "Unknown"
      )

      io.in(roomId).emit("ready-status-update", {
        readyCount,
        totalPlayers: totalPlayers - 1, // Exclude host from count
        readyPlayerNames,
        allReady: readyCount >= totalPlayers - 1,
      })

      console.log(
        `[Room ${roomId}] ${
          user.username
        } is ready for new game (${readyCount}/${totalPlayers - 1})`
      )
    } catch (error) {
      console.error("Error joining new game:", error)
      socket.emit("error", "Failed to join new game")
    }
  })

  socket.on("word-chosen", async (roomId, chosenWord) => {
    try {
      const room = await Room.findOne({ roomId })
      if (
        !room ||
        room.currentDrawerId !== socket.id ||
        room.roundPhase !== "choose-word"
      ) {
        console.log(
          `[Room ${roomId}] Invalid word choice attempt by ${socket.id}`
        )
        return
      }

      // Verify the chosen word is from the available options
      if (!room.tempWordOptions || !room.tempWordOptions.includes(chosenWord)) {
        console.log(
          `[Room ${roomId}] Invalid word selection: "${chosenWord}" not in options`
        )
        return socket.emit("error", "Invalid word selection")
      }

      // Clear auto-selection timer
      if (
        global.roomTimers &&
        global.roomTimers[roomId] &&
        global.roomTimers[roomId].autoSelect
      ) {
        clearTimeout(global.roomTimers[roomId].autoSelect)
        delete global.roomTimers[roomId].autoSelect
        console.log(
          `[Room ${roomId}] Auto-selection timer cleared - word chosen manually`
        )
      }

      room.currentWord = chosenWord
      await room.save()

      const drawerName =
        room.users.find((u) => u.id === socket.id)?.username || "Unknown"
      console.log(
        `[Room ${roomId}] ${drawerName} manually chose word: "${chosenWord}"`
      )

      await startDrawingPhase(roomId)
    } catch (error) {
      console.error("Error in word-chosen:", error)
    }
  })

  socket.on("send-message", async ({ roomId, message }) => {
    try {
      const room = await Room.findOne({ roomId })
      if (!room) return

      const user = room.users.find((u) => u.id === socket.id)
      if (!user) return

      const timestamp = new Date()
      const isCorrect =
        room.gameState === "playing" &&
        room.roundPhase === "drawing" &&
        socket.id !== room.currentDrawerId &&
        message.toLowerCase().trim() === room.currentWord.toLowerCase() &&
        !room.correctGuessers.includes(socket.id)

      // Always log message to room-specific collection with timestamp
      const RoomData = getRoomDataModel(roomId)
      await new RoomData({
        type: "message",
        data: {
          message,
          isGuess: isCorrect,
          word: isCorrect ? room.currentWord : null,
          roundPhase: room.roundPhase,
          timestamp: timestamp,
        },
        userId: socket.id,
        username: user.username,
      }).save()

      if (isCorrect) {
        const timeTaken = (Date.now() - room.startTime) / 1000
        const points = Math.max(10, 150 - Math.floor(timeTaken))

        // Update scores
        user.score += points
        const drawer = room.users.find((u) => u.id === room.currentDrawerId)
        if (drawer) drawer.score += 50

        // Store round score
        room.roundScores.push({
          userId: socket.id,
          points: points,
          reason: "correct_guess",
          timeTaken: timeTaken,
        })

        if (
          drawer &&
          !room.roundScores.find((score) => score.userId === drawer.id)
        ) {
          room.roundScores.push({
            userId: drawer.id,
            points: 50,
            reason: "successful_drawing",
          })
        }

        room.correctGuessers.push(socket.id)
        await room.save()

        // Send private message to the guesser showing the word
        socket.emit("correct-guess-private", {
          word: room.currentWord,
          points: points,
          message: `You guessed "${room.currentWord}" correctly! (+${points} pts)`,
        })

        // Send public message to everyone else (not showing the actual guess)
        socket
          .to(roomId)
          .emit(
            "system-message",
            `${user.username} guessed the word! (+${points} pts)`
          )

        // Log correct guess
        await new RoomData({
          type: "game_event",
          data: {
            event: "correct_guess",
            word: room.currentWord,
            points,
            timeTaken,
          },
          userId: socket.id,
          username: user.username,
        }).save()

        await emitRoomUpdate(roomId)

        // Check if all players (except drawer) have guessed correctly
        const totalGuessers = room.users.length - 1 // Exclude drawer
        const correctGuessers = room.correctGuessers.length

        if (correctGuessers >= totalGuessers) {
          // Everyone guessed correctly - end round early
          io.in(roomId).emit("system-message", "Everyone guessed the word!")
          io.in(roomId).emit("word-revealed", { word: room.currentWord })
          room.isWordGuessed = true
          await room.save()
          await showRoundResults(roomId)
        }
      } else {
        // Show incorrect guesses in public chat with timestamp
        const messageWithTimestamp = {
          username: user.username,
          message: message,
          timestamp: timestamp.toISOString(),
        }
        io.in(roomId).emit("new-message", messageWithTimestamp)
      }
    } catch (error) {
      console.error("Error in send-message:", error)
    }
  })

  socket.on("canvas-state-update", async ({ roomId, history }) => {
    try {
      const room = await Room.findOne({ roomId })
      if (
        room &&
        (room.currentDrawerId === socket.id || room.hostId === socket.id)
      ) {
        room.canvasHistory = history
        await room.save()

        // Log canvas update to room-specific collection
        const RoomData = getRoomDataModel(roomId)
        await new RoomData({
          type: "canvas",
          data: { historyLength: history.length },
          userId: socket.id,
          username: room.users.find((u) => u.id === socket.id)?.username,
        }).save()

        socket.to(roomId).emit("canvas-state", history)
      }
    } catch (error) {
      console.error("Error updating canvas state:", error)
    }
  })

  // Add explicit leave room handler
  socket.on("leave-room", async (roomId) => {
    try {
      const room = await Room.findOne({ roomId })
      if (!room) return

      const user = room.users.find((u) => u.id === socket.id)
      if (!user) return

      // Log user leaving
      const RoomData = getRoomDataModel(roomId)
      await new RoomData({
        type: "game_event",
        data: { event: "user_left", voluntary: true },
        userId: socket.id,
        username: user.username,
      }).save()

      // Remove user and handle cleanup
      await handleUserLeaving(room, socket.id, true)

      socket.leave(roomId)
      console.log(`[Room ${roomId}] ${user.username} left voluntarily`)
    } catch (error) {
      console.error("Error in leave-room:", error)
    }
  })

  // Helper function for user leaving logic
  async function handleUserLeaving(room, socketId, voluntary = false) {
    const user = room.users.find((u) => u.id === socketId)
    const username = user?.username || "A player"

    // Store user's roles before removal
    const wasHost = room.hostId === socketId
    const wasCurrentDrawer = room.currentDrawerId === socketId

    // Clear any active timers for this room if it's being deleted
    if (global.roomTimers && global.roomTimers[room.roomId]) {
      Object.values(global.roomTimers[room.roomId]).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
      delete global.roomTimers[room.roomId]
    }

    // Remove user from room
    room.users = room.users.filter((u) => u.id !== socketId)

    if (room.users.length === 0) {
      // Clean up room-specific collection when room is deleted
      const RoomData = getRoomDataModel(room.roomId)
      await RoomData.collection.drop().catch(() => {}) // Ignore error if collection doesn't exist

      // Delete room
      await Room.deleteOne({ roomId: room.roomId })
      console.log(`Room ${room.roomId} and its collection deleted.`)
    } else {
      // Transfer host if needed
      if (wasHost) {
        room.hostId = room.users[0].id
        console.log(
          `[Room ${room.roomId}] Host transferred to ${room.users[0].username}`
        )
      }

      // Remove from turn order
      room.turnOrder = room.turnOrder.filter((id) => id !== socketId)

      // Handle game state if current drawer left
      if (wasCurrentDrawer && room.gameState === "playing") {
        room.currentDrawerId = null
        room.currentRound++
        await room.save()
        io.in(room.roomId).emit(
          "system-message",
          `${username} has left the game. Starting a new round.`
        )
        startNextRound(room.roomId)
      } else {
        await room.save()
      }

      if (room.gameState === "playing" && !voluntary) {
        io.in(room.roomId).emit(
          "system-message",
          `${username} has left the game.`
        )
      }

      await emitRoomUpdate(room.roomId)
    }
  }

  socket.on("disconnect", async () => {
    try {
      console.log("User disconnected:", socket.id)

      // Add a delay before processing disconnect to allow for immediate reconnection
      setTimeout(async () => {
        try {
          // Find the room containing this user
          const room = await Room.findOne({ "users.id": socket.id })
          if (!room) return

          const user = room.users.find((u) => u.id === socket.id)
          const username = user?.username || "A player"

          // Check if user has reconnected with a different socket ID
          const userStillExists = room.users.find(
            (u) => u.username === username && u.id !== socket.id
          )
          if (userStillExists) {
            console.log(
              `[Room ${room.roomId}] ${username} already reconnected, skipping disconnect cleanup`
            )
            return
          }

          // Log disconnection
          const RoomData = getRoomDataModel(room.roomId)
          await new RoomData({
            type: "game_event",
            data: { event: "user_disconnected", voluntary: false },
            userId: socket.id,
            username,
          }).save()

          await handleUserLeaving(room, socket.id, false)
        } catch (error) {
          console.error("Error in delayed disconnect:", error)
        }
      }, 3000)
    } catch (error) {
      console.error("Error in disconnect:", error)
    }
  })
})

app.get("/", (req, res) => {
  res.send("Server is running 🚀")
})

server.listen(PORT, () =>
  console.log(`🚀 Backend server running on port ${PORT}`)
)
