import React, { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

// Import Types
import type {
  RoomState,
  Message,
  ServerToClientEvents,
  ClientToServerEvents,
  ReadyStatus,
  FinalScores,
  RoundInfo,
} from "../types"

// Import Screen Components
import LobbyScreen from "../components/screens/LobbyScreen"
import GameRoom from "../components/screens/GameRoom"
import FinalResultsScreen from "../components/screens/FinalResultsScreen"
import GameOverScreen from "../components/screens/GameOverScreen"

const SERVER_URL = "http://localhost:4000"

const App: React.FC = () => {
  const [username, setUsername] = useState<string>(
    localStorage.getItem("username") || ""
  )
  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState<string>("")

  // Game State
  const [gameState, setGameState] = useState<
    "lobby" | "playing" | "final-results" | "game-over"
  >("lobby")
  const [readyStatus, setReadyStatus] = useState<ReadyStatus | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [roundPhase, setRoundPhase] = useState<
    "choose-word" | "drawing" | "results" | null
  >(null)
  const [wordOptions, setWordOptions] = useState<string[]>([])
  const [roundResults, setRoundResults] = useState<any[]>([])
  const [drawerName, setDrawerName] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [systemMessage, setSystemMessage] = useState<string>("")
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null)
  const [secretWord, setSecretWord] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [roundInfo, setRoundInfo] = useState<RoundInfo>({
    round: 0,
    totalRounds: 0,
  })
  const [finalScores, setFinalScores] = useState<FinalScores[]>([])
  const [isWordGuessed, setIsWordGuessed] = useState(false)
  const [revealTimer, setRevealTimer] = useState<number>(0)

  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null)

  // --- Socket Setup ---
  useEffect(() => {
    if (!username) return

    const lastRoomId = localStorage.getItem("lastRoomId")
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      SERVER_URL,
      {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    )
    socketRef.current = socket

    socket.on("connect", () => {
      if (lastRoomId) {
        socket.emit("reconnect-room", lastRoomId, username)
      }
    })

    socket.on("room-update", (roomState) => {
      setRoom(roomState)
      setError("")
      localStorage.setItem("lastRoomId", roomState.roomId)
      if (roomState.locked && gameState === "lobby") {
        setGameState("playing")
      }
    })

    socket.on("choose-word-phase", (data) => {
      setGameState("playing")
      setRoundPhase("choose-word")
      setCurrentDrawerId(data.drawerId)
      setDrawerName(data.drawerName)
      setTimeLeft(data.time)
      setRoundInfo({ round: data.round, totalRounds: data.totalRounds })
      setIsWordGuessed(false)
      setRevealTimer(0)
      setMessages([])
      setSystemMessage("")
    })

    socket.on("choose-word-options", (words) => setWordOptions(words))

    socket.on("drawing-phase", (data) => {
      setRoundPhase("drawing")
      setCurrentDrawerId(data.drawerId)
      setTimeLeft(data.time)
      setRoundInfo({ round: data.round, totalRounds: data.totalRounds })
      setWordOptions([])
    })

    socket.on("round-results", (data) => {
      setRoundPhase("results")
      setRoundResults(data.results)
      setTimeLeft(data.time)
      setSecretWord(data.word)
    })

    socket.on("new-round", (data) => {
      setMessages([])
      setSystemMessage("")
      setCurrentDrawerId(data.drawerId)
      setSecretWord("")
      setGameState("playing")
      setRoundPhase("drawing")
      setFinalScores([])
      setTimeLeft(data.time)
      setRoundInfo({ round: data.round, totalRounds: data.totalRounds })
      setIsWordGuessed(false)
      setRevealTimer(0)
    })

    socket.on("your-turn", (word) => setSecretWord(word))
    socket.on("new-message", (msg) => setMessages((prev) => [...prev, msg]))
    socket.on("system-message", (msg) => setSystemMessage(msg))

    socket.on("word-guessed", (data) => {
      setIsWordGuessed(true)
      setSecretWord(data.word)
      setRevealTimer(10)
      setTimeLeft(10)
    })

    socket.on("game-over", (scores) => {
      setGameState("game-over")
      setFinalScores(scores)
      setCurrentDrawerId(null)
      setSecretWord("")
      setRevealTimer(0)
      setIsWordGuessed(false)
    })

    socket.on("room-closed", () => {
      setRoom(null)
      setGameState("lobby")
      alert("The room was closed.")
    })

    socket.on("error", (msg) => setError(msg))

    socket.on("new-game-started", () => {
      setGameState("lobby")
      setRoundPhase(null)
      setWordOptions([])
      setRoundResults([])
      setDrawerName("")
      setMessages([])
      setSystemMessage("")
      setCurrentDrawerId(null)
      setSecretWord("")
      setTimeLeft(0)
      setRoundInfo({ round: 0, totalRounds: 0 })
      setFinalScores([])
      setIsWordGuessed(false)
      setRevealTimer(0)
      setIsReady(false)
      setReadyStatus(null)
    })

    socket.on("joined-new-game", () => {
      setGameState("lobby")
      setIsReady(true)
    })

    socket.on("final-results", (data) => {
      setGameState("final-results")
      setFinalScores(data.scores)
      setTimeLeft(data.time)
      setRoundInfo({ round: data.totalRounds, totalRounds: data.totalRounds })
    })

    socket.on("chat-history", (history) => setMessages(history))
    socket.on("ready-status-update", (data) => setReadyStatus(data))

    return () => {
      socket.disconnect()
    }
    // eslint-disable-next-line
  }, [username])

  // --- Timer Logic ---
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "final-results") return

    if (gameState === "final-results" && timeLeft > 0) {
      const timer = setInterval(
        () => setTimeLeft((t) => Math.max(0, t - 1)),
        1000
      )
      return () => clearInterval(timer)
    }

    if (gameState === "playing") {
      if (isWordGuessed && revealTimer > 0) {
        const timer = setInterval(
          () => setRevealTimer((t) => Math.max(0, t - 1)),
          1000
        )
        return () => clearInterval(timer)
      }
      if (!isWordGuessed && timeLeft > 0) {
        const timer = setInterval(
          () => setTimeLeft((t) => Math.max(0, t - 1)),
          1000
        )
        return () => clearInterval(timer)
      }
    }
  }, [gameState, isWordGuessed, timeLeft, revealTimer])

  // --- Handlers ---
  const handleSetUsername = (name: string) => {
    if (name.trim()) {
      setUsername(name.trim())
      localStorage.setItem("username", name.trim())
    }
  }

  const handleCreateRoom = () =>
    socketRef.current?.emit("create-room", username)
  const handleJoinRoom = (roomId: string) =>
    socketRef.current?.emit("join-room", roomId.toUpperCase(), username)
  const handleStartGame = () =>
    room && socketRef.current?.emit("start-game", room.roomId)
  const handleStartNewGame = () =>
    room && socketRef.current?.emit("start-new-game", room.roomId)
  const handleJoinNewGame = () => {
    if (room && !isReady) {
      socketRef.current?.emit("join-new-game", room.roomId)
    }
  }
  const handleSendMessage = (message: string) => {
    if (room && message.trim())
      socketRef.current?.emit("send-message", { roomId: room.roomId, message })
  }
  const handleWordChoice = (word: string) => {
    if (room && roundPhase === "choose-word") {
      socketRef.current?.emit("word-chosen", room.roomId, word)
    }
  }
  const handleLeaveRoom = () => {
    localStorage.removeItem("lastRoomId")
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setRoom(null)
    setGameState("lobby")
    setError("")
    // Reset all other states
    setTimeout(() => window.location.reload(), 100)
  }

  // --- Render Logic ---
  if (!username || !room) {
    return (
      <LobbyScreen
        username={username}
        error={error}
        onSetUsername={handleSetUsername}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    )
  }

  if (gameState === "final-results") {
    return (
      <FinalResultsScreen
        finalScores={finalScores}
        timeLeft={timeLeft}
        roundInfo={roundInfo}
      />
    )
  }

  if (gameState === "game-over") {
    return (
      <GameOverScreen
        finalScores={finalScores}
        isHost={socketRef.current?.id === room.hostId}
        isReady={isReady}
        readyStatus={readyStatus}
        onStartNewGame={handleStartNewGame}
        onJoinNewGame={handleJoinNewGame}
        onLeaveRoom={handleLeaveRoom}
      />
    )
  }

  // Lobby or Playing state
  return (
    <GameRoom
      socket={socketRef.current!}
      room={room}
      gameState={gameState}
      roundPhase={roundPhase}
      isDrawer={socketRef.current?.id === currentDrawerId}
      isHost={socketRef.current?.id === room.hostId}
      currentDrawerId={currentDrawerId}
      drawerName={drawerName}
      timeLeft={timeLeft}
      secretWord={secretWord}
      roundInfo={roundInfo}
      isWordGuessed={isWordGuessed}
      revealTimer={revealTimer}
      wordOptions={wordOptions}
      roundResults={roundResults}
      messages={messages}
      systemMessage={systemMessage}
      onHandleLeaveRoom={handleLeaveRoom}
      onHandleStartGame={handleStartGame}
      onHandleWordChoice={handleWordChoice}
      onHandleSendMessage={handleSendMessage}
    />
  )
}

export default App
