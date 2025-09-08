import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Import Types
import type {
  RoomState,
  Message,
  ServerToClientEvents,
  ClientToServerEvents,
  ReadyStatus,
  FinalScores,
  RoundInfo,
} from "../types";

// Import Screen Components
import LobbyScreen from "../components/screens/LobbyScreen";
import LobbyRoom from "../components/screens/LobbyRoom";
import GameRoom from "../components/screens/GameRoom";
import FinalResultsScreen from "../components/screens/FinalResultsScreen";

const SERVER_URL = "http://localhost:4000";

const App: React.FC = () => {
  const [username, setUsername] = useState<string>(localStorage.getItem("username") || "");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string>("");

  // Game State
  const [gameState, setGameState] = useState<"lobby" | "playing" | "final-results">("lobby");
  const [readyStatus, setReadyStatus] = useState<ReadyStatus | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [roundPhase, setRoundPhase] = useState<"choose-word" | "drawing" | "results" | null>(null);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [roundResults, setRoundResults] = useState<any[]>([]);
  const [drawerName, setDrawerName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [currentDrawerId, setCurrentDrawerId] = useState<string | null>(null);
  const [secretWord, setSecretWord] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundInfo, setRoundInfo] = useState<RoundInfo>({ round: 0, totalRounds: 0 });
  const [finalScores, setFinalScores] = useState<FinalScores[]>([]);
  const [isWordGuessed, setIsWordGuessed] = useState(false);
  const [revealTimer, setRevealTimer] = useState<number>(0);
  const [revealedChars, setRevealedChars] = useState<number[]>([]);
  const [hintNotification, setHintNotification] = useState<string>("");

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const isDrawer = socketRef.current?.id === currentDrawerId;

  // --- Socket Setup ---
  useEffect(() => {
    if (!username) return;

    const lastRoomId = localStorage.getItem("lastRoomId");
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (lastRoomId) {
        socket.emit("reconnect-room", lastRoomId, username);
      }
    });

    socket.on("room-update", (roomState) => {
      setRoom(roomState);
      setError("");
      localStorage.setItem("lastRoomId", roomState.roomId);
      if (roomState.locked && gameState === "lobby") {
        setGameState("playing");
      }
    });

    socket.on("choose-word-phase", (data) => {
      setGameState("playing");
      setRoundPhase("choose-word");
      setCurrentDrawerId(data.drawerId);
      setDrawerName(data.drawerName);
      setTimeLeft(data.time);
      setRoundInfo({ round: data.round, totalRounds: data.totalRounds });
      setIsWordGuessed(false);
      setRevealTimer(0);
      setMessages([]);
      setSystemMessage("");
    });

    socket.on("choose-word-options", (words) => setWordOptions(words));
    
    socket.on("drawing-phase", (data) => {
      setRoundPhase("drawing");
      setCurrentDrawerId(data.drawerId);
      setTimeLeft(data.time);
      setRoundInfo({ round: data.round, totalRounds: data.totalRounds });
      setWordOptions([]);
      setRevealedChars([]);
      setHintNotification(""); // Clear any previous hints
    });

    socket.on("round-results", (data) => {
      setRoundPhase("results");
      setRoundResults(data.results);
      setTimeLeft(data.time);
      setSecretWord(data.word);
    });

    socket.on("new-round", (data) => {
      setMessages([]);
      setSystemMessage("");
      setCurrentDrawerId(data.drawerId);
      setSecretWord("");
      setGameState("playing");
      setRoundPhase("drawing");
      setFinalScores([]);
      setTimeLeft(data.time);
      setRoundInfo({ round: data.round, totalRounds: data.totalRounds });
      setIsWordGuessed(false);
      setRevealTimer(0);
      setHintNotification(""); // Clear any previous hints
    });

    socket.on("your-turn", (word) => setSecretWord(word));

    socket.on("word-hint-initial", (data) => {
      // Set initial word hint for non-drawers
      setSecretWord(data.wordHint);
      console.log(`Initial word hint: "${data.wordHint}" (${data.wordLength} characters)`);
    });

    socket.on("new-message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("system-message", (msg) => setSystemMessage(msg));

    socket.on("word-guessed", (data) => {
      setIsWordGuessed(true);
      setSecretWord(data.word);
      setRevealTimer(10);
      setTimeLeft(10);
    });

    socket.on("word-hint-update", (data) => {
      setSecretWord(data.wordHint);
      setRevealedChars(prev => {
        if (!prev.includes(data.position)) {
          return [...prev, data.position];
        }
        return prev;
      });
      
      // Show hint notification (only for non-drawers)
      if (!isDrawer) {
        setHintNotification(`💡 Hint ${data.hintNumber}/2: Letter "${data.revealedChar.toUpperCase()}" revealed! (${data.totalRevealed} total)`);
        setTimeout(() => setHintNotification(""), 3000); // Clear after 3 seconds
      }
      
      console.log(`Hint ${data.hintNumber}: Revealed '${data.revealedChar}' at position ${data.position}`);
    });

    socket.on("current-game-state", (data) => {
      // Handle reconnection/mid-game join - sync current state
      setSecretWord(data.wordHint);
      setRevealedChars(data.revealedChars);
      setCurrentDrawerId(data.drawerId);
      setRoundInfo({ round: data.round, totalRounds: data.totalRounds });
      setIsWordGuessed(data.isWordGuessed);
      console.log(`Synced game state: ${data.revealedChars.length} characters revealed`);
    });

    socket.on("word-revealed", (data) => {
      setSecretWord(data.word);
      setIsWordGuessed(true);
    });

    socket.on("game-over", (scores) => {
      setGameState("final-results");
      setFinalScores(scores);
      setCurrentDrawerId(null);
      setSecretWord("");
      setRevealTimer(0);
      setIsWordGuessed(false);
      setRevealedChars([]);
    });

    socket.on("room-closed", () => {
      setRoom(null);
      setGameState("lobby");
      alert("The room was closed.");
    });

    socket.on("error", (msg) => setError(msg));
    
    socket.on("new-game-started", () => {
      setGameState("lobby");
      setRoundPhase(null);
      setWordOptions([]);
      setRoundResults([]);
      setDrawerName("");
      setMessages([]);
      setSystemMessage("");
      setCurrentDrawerId(null);
      setSecretWord("");
      setTimeLeft(0);
      setRoundInfo({ round: 0, totalRounds: 0 });
      setFinalScores([]);
      setIsWordGuessed(false);
      setRevealTimer(0);
      setIsReady(false);
      setReadyStatus(null);
    });

    socket.on("joined-new-game", () => {
      setGameState("lobby");
      setIsReady(true);
    });

    socket.on("final-results", (data) => {
      setGameState("final-results");
      setFinalScores(data.scores);
      setTimeLeft(data.time);
      setRoundInfo({ round: data.totalRounds, totalRounds: data.totalRounds });
    });

    socket.on("chat-history", (history) => setMessages(history));
    socket.on("ready-status-update", (data) => {
      setReadyStatus(data);
      // Update local isReady state based on server response
      if (socketRef.current?.id && data[socketRef.current.id] !== undefined) {
        setIsReady(data[socketRef.current.id]);
      }
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [username]);

  // --- Timer Logic with Character Revealing ---
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "final-results") return;

    if (gameState === "final-results" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
      return () => clearInterval(timer);
    }

    if (gameState === "playing") {
      if (isWordGuessed && revealTimer > 0) {
        const timer = setInterval(() => setRevealTimer((t) => Math.max(0, t - 1)), 1000);
        return () => clearInterval(timer);
      }
      if (!isWordGuessed && timeLeft > 0) {
        const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
        return () => clearInterval(timer);
      }
    }
  }, [gameState, isWordGuessed, timeLeft, revealTimer]);

  // --- Handlers ---
  const handleSetUsername = (name: string) => {
    if (name.trim()) {
      setUsername(name.trim());
      localStorage.setItem("username", name.trim());
    }
  };

  const handleCreateRoom = () => socketRef.current?.emit("create-room", username);
  const handleJoinRoom = (roomId: string) => socketRef.current?.emit("join-room", roomId.toUpperCase(), username);
  const handleStartGame = () => room && socketRef.current?.emit("start-game", room.roomId);
  const handleToggleReady = () => {
    if (room && socketRef.current) {
      socketRef.current.emit("toggle-ready", room.roomId);
    }
  };
  const handleReturnToLobby = () => {
    // After game completion, redirect to Join/Create screen
    localStorage.removeItem("lastRoomId");
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    // Reset all game state and go back to username entry
    setRoom(null);
    setGameState("lobby");
    setFinalScores([]);
    setTimeLeft(0);
    setMessages([]);
    setSystemMessage("");
    setCurrentDrawerId(null);
    setSecretWord("");
    setIsWordGuessed(false);
    setRevealTimer(0);
    setRevealedChars([]);
    setRoundPhase(null);
    setRoundResults([]);
    setWordOptions([]);
    setIsReady(false);
    setReadyStatus(null);
    // Don't clear username so they can easily rejoin
  };
  const handleSendMessage = (message: string) => {
    if (room && message.trim()) socketRef.current?.emit("send-message", { roomId: room.roomId, message });
  };
  const handleWordChoice = (word: string) => {
    if (room && roundPhase === "choose-word") {
      socketRef.current?.emit("word-chosen", room.roomId, word);
    }
  };
  const handleLeaveRoom = () => {
    localStorage.removeItem("lastRoomId");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setRoom(null);
    setGameState("lobby");
    setError("");
    // Reset all other states
    setTimeout(() => window.location.reload(), 100);
  };

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
    );
  }

  if (gameState === "final-results") {
    return (
      <FinalResultsScreen
        finalScores={finalScores}
        timeLeft={timeLeft}
        roundInfo={roundInfo}
        onReturnToLobby={handleReturnToLobby}
      />
    );
  }

  // Show lobby room when in lobby state
  if (gameState === "lobby") {
    return (
      <LobbyRoom
        socket={socketRef.current!}
        room={room}
        messages={messages}
        readyStatus={readyStatus}
        isHost={socketRef.current?.id === room.hostId}
        isReady={isReady}
        onLeaveRoom={handleLeaveRoom}
        onStartGame={handleStartGame}
        onSendMessage={handleSendMessage}
        onToggleReady={handleToggleReady}
      />
    );
  }

  // Playing state
  return (
    <GameRoom
      socket={socketRef.current!}
      room={room}
      gameState={gameState}
      roundPhase={roundPhase}
      isDrawer={isDrawer}
      isHost={socketRef.current?.id === room.hostId}
      currentDrawerId={currentDrawerId}
      drawerName={drawerName}
      timeLeft={timeLeft}
      secretWord={secretWord}
      roundInfo={roundInfo}
      isWordGuessed={isWordGuessed}
      revealTimer={revealTimer}
      revealedChars={revealedChars}
      wordOptions={wordOptions}
      roundResults={roundResults}
      messages={messages}
      systemMessage={systemMessage}
      hintNotification={hintNotification}
      onHandleLeaveRoom={handleLeaveRoom}
      onHandleStartGame={handleStartGame}
      onHandleWordChoice={handleWordChoice}
      onHandleSendMessage={handleSendMessage}
    />
  );
};

export default App;