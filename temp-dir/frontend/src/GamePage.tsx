import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Lobby from "./components/Lobby";
import PlayerList from "./components/PlayerList";
import GameInfoBar from "./components/GameInfoBar";
import Canvas from "./components/Canvas";
import ChatBox from "./components/ChatBox";

// --- TYPE DEFINITIONS ---
export interface User {
  id: string;
  username: string;
  score: number;
}
export interface RoomState {
  roomId: string;
  users: User[];
  hostId: string;
  locked: boolean;
}
export interface Message {
  username: string;
  message: string;
}
export interface ServerToClientEvents {
  "room-update": (roomState: RoomState) => void;
  "room-closed": () => void;
  "error": (msg: string) => void;
  "canvas-state": (fullHistory: any[][]) => void;
  "canvas-cleared": () => void;
  "new-round": (data: { drawerId: string; round: number; totalRounds: number; time: number; }) => void;
  "choose-word-phase": (data: { drawerId: string; drawerName: string; round: number; totalRounds: number; time: number; }) => void;
  "choose-word-options": (words: string[]) => void;
  "drawing-phase": (data: { drawerId: string; round: number; totalRounds: number; time: number; }) => void;
  "round-results": (data: { round: number; results: any[]; word: string; time: number; }) => void;
  "your-turn": (word: string) => void;
  "new-message": (msg: Message) => void;
  "system-message": (msg: string) => void;
  "game-over": (scores: { username: string; score: number }[]) => void;
  "word-guessed": (data: { word: string }) => void;
  "new-game-started": () => void;
  "joined-new-game": () => void;
  "final-results": (data: { scores: any[]; totalRounds: number; time: number; }) => void;
  "chat-history": (messages: Message[]) => void;
  "ready-status-update": (data: { readyCount: number; totalPlayers: number; readyPlayerNames: string[]; allReady: boolean; }) => void;
}
export interface ClientToServerEvents {
  "create-room": (username: string) => void;
  "join-room": (roomId: string, username: string) => void;
  "start-game": (roomId: string) => void;
  "start-new-game": (roomId: string) => void;
  "join-new-game": (roomId: string) => void;
  "word-chosen": (roomId: string, word: string) => void;
  "send-message": (data: { roomId: string, message: string }) => void;
  "clear-canvas": (roomId: string) => void;
  "canvas-state-update": (data: { roomId: string, history: any[][] }) => void;
  "reconnect-room": (roomId: string, username: string) => void;
}

const SERVER_URL = "http://localhost:4000";

const App: React.FC = () => {
  const [username, setUsername] = useState<string>(localStorage.getItem("username") || "");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string>("");

  // Game State
  const [gameState, setGameState] = useState<"lobby" | "playing" | "final-results" | "game-over">("lobby");
  const [readyStatus, setReadyStatus] = useState<{ readyCount: number; totalPlayers: number; readyPlayerNames: string[]; allReady: boolean; } | null>(null);
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
  const [roundInfo, setRoundInfo] = useState<{ round: number; totalRounds: number }>({ round: 0, totalRounds: 0 });
  const [finalScores, setFinalScores] = useState<{ username: string; score: number }[]>([]);
  const [isWordGuessed, setIsWordGuessed] = useState(false);
  const [revealTimer, setRevealTimer] = useState<number>(0);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

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
      // Try to reconnect to last room if we have one
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

    socket.on("choose-word-options", (words) => {
      setWordOptions(words);
    });

    socket.on("drawing-phase", (data) => {
      setRoundPhase("drawing");
      setCurrentDrawerId(data.drawerId);
      setTimeLeft(data.time);
      setRoundInfo({ round: data.round, totalRounds: data.totalRounds });
      setWordOptions([]);
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
    });

    socket.on("your-turn", (word) => setSecretWord(word));
    socket.on("new-message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("system-message", (msg) => setSystemMessage(msg));

    socket.on("word-guessed", (data) => {
      setIsWordGuessed(true);
      setSecretWord(data.word);
      setRevealTimer(10);
      setTimeLeft(10);
    });

    socket.on("game-over", (scores) => {
      setGameState("game-over");
      setFinalScores(scores);
      setCurrentDrawerId(null);
      setSecretWord("");
      setRevealTimer(0);
      setIsWordGuessed(false);
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

    socket.on("chat-history", (history) => {
      setMessages(history);
    });

    socket.on("ready-status-update", (data) => {
      setReadyStatus(data);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [username, gameState]);

  // --- Timer Logic ---
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
  const handleStartGame = () => {
    if (room) socketRef.current?.emit("start-game", room.roomId);
  };
  const handleStartNewGame = () => {
    if (room) socketRef.current?.emit("start-new-game", room.roomId);
  };
  const handleJoinNewGame = () => {
    if (room && !isReady) {
      socketRef.current?.emit("join-new-game", room.roomId);
    }
  };
  const handleSendMessage = (message: string) => {
    if (room && message.trim()) socketRef.current?.emit("send-message", { roomId: room.roomId, message });
  };
  const handleWordChoice = (word: string) => {
    if (room && roundPhase === "choose-word") {
      socketRef.current?.emit("word-chosen", room.roomId, word);
    }
  };

  // Add a function to handle page reload/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (room) {
        localStorage.setItem("lastRoomId", room.roomId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [room]);

  // Add cleanup when leaving room manually
  const handleLeaveRoom = () => {
    localStorage.removeItem("lastRoomId");

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setRoom(null);
    setGameState("lobby");
    setMessages([]);
    setSystemMessage("");
    setCurrentDrawerId(null);
    setSecretWord("");
    setTimeLeft(0);
    setRoundInfo({ round: 0, totalRounds: 0 });
    setFinalScores([]);
    setIsWordGuessed(false);
    setRevealTimer(0);
    setError("");
    setReadyStatus(null);

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!username) {
    return <Lobby onSetUsername={handleSetUsername} />;
  }
  if (!room) {
    return (
      <Lobby
        onSetUsername={handleSetUsername}
        username={username}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        error={error}
      />
    );
  }
  if (gameState === "game-over") {
    const isHost = socketRef.current?.id === room.hostId;
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4">
        <div className="bg-white border-2 border-black rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="bg-black text-white px-6 py-3 rounded-full mb-8 text-center">
            <h1 className="text-3xl font-bold uppercase">Game Over!</h1>
          </div>
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-200 text-center mb-4">Final Scores</h2>
            {finalScores.map((player, index) => (
              <div
                key={player.username}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0
                    ? "bg-yellow-600 text-yellow-100"
                    : index === 1
                    ? "bg-gray-600 text-gray-100"
                    : index === 2
                    ? "bg-amber-700 text-amber-100"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">#{index + 1}</span>
                  {index === 0 && <span>🏆</span>}
                  {index === 1 && <span>🥈</span>}
                  {index === 2 && <span>🥉</span>}
                  <span className="font-semibold">{player.username}</span>
                </div>
                <span className="text-lg font-bold">{player.score} pts</span>
              </div>
            ))}
          </div>

          {readyStatus && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Players Ready:</h3>
              <div className="text-sm text-gray-300 mb-2">
                {readyStatus.readyCount}/{readyStatus.totalPlayers} players ready
              </div>
              <div className="text-xs text-gray-400">
                Ready: {readyStatus.readyPlayerNames.join(", ") || "None"}
              </div>
              {readyStatus.allReady && isHost && (
                <div className="mt-2 text-green-400 text-sm font-semibold">
                  ✅ All players ready! You can start the new game.
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-3">
            {isHost ? (
              <button
                onClick={handleStartNewGame}
                disabled={!readyStatus?.allReady}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors ${
                  readyStatus?.allReady
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {readyStatus?.allReady
                  ? "🔄 Start New Game"
                  : "⏳ Waiting for Players..."}
              </button>
            ) : (
              <button
                onClick={handleJoinNewGame}
                disabled={isReady}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors ${
                  isReady
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isReady ? "✅ Ready!" : "🎮 Ready for New Game"}
              </button>
            )}
            <button
              onClick={handleLeaveRoom}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              🚪 Leave Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show final results before game over
  if (gameState === "final-results") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-8 max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-6 text-blue-400">
            🎉 Game Complete! 🎉
          </h1>
          <p className="text-center text-gray-300 mb-6">
            All {roundInfo.totalRounds} rounds completed!
          </p>
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 text-center mb-4">
              Final Standings
            </h2>
            {finalScores.map((player, index) => (
              <div
                key={player.username}
                className={`flex justify-between items-center p-4 rounded-lg ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-500 text-yellow-100"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-600 to-gray-500 text-gray-100"
                    : index === 2
                    ? "bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">#{index + 1}</span>
                  {index === 0 && <span className="text-2xl">👑</span>}
                  {index === 1 && <span className="text-2xl">🥈</span>}
                  {index === 2 && <span className="text-2xl">🥉</span>}
                  <span className="text-xl font-semibold">{player.username}</span>
                </div>
                <span className="text-2xl font-bold">{player.score} pts</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-4">Game ending in {timeLeft} seconds...</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDrawer = socketRef.current?.id === currentDrawerId;
  const isHost = socketRef.current?.id === room.hostId;

  return (
    <div className="flex flex-col h-screen p-4 gap-4 max-w-7xl mx-auto bg-white">
      <header className="flex justify-between items-center mb-2">
        <div className="bg-black text-white px-4 py-2 rounded-full relative">
          <h1 className="text-2xl font-bold">STAKEBOARD</h1>
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
        </div>
        <div>
          <span className="mr-4 text-black font-bold">
            Room: <strong className="text-red-600">{room.roomId}</strong>
          </span>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-600 border-2 border-red-600 rounded-full hover:bg-red-700 text-sm text-white font-bold uppercase transition"
          >
            Leave Room
          </button>
        </div>
      </header>
      <main className="grid grid-cols-5 gap-4 flex-1 min-h-0">
        <div className="col-span-1">
          <PlayerList
            users={room.users}
            drawerId={currentDrawerId}
            hostId={room.hostId}
            myId={socketRef.current?.id || ""}
          />
        </div>
        <div className="col-span-3 flex flex-col gap-2">
          {gameState === "playing" ? (
            <>
              {roundPhase === "choose-word" && (
                <div className="h-14 flex items-center justify-center bg-purple-900 rounded-2xl border border-purple-700 shadow text-purple-100 text-lg">
                  {isDrawer
                    ? "Choose a word to draw!"
                    : `${drawerName} is choosing a word... (${timeLeft}s)`}
                </div>
              )}
              {roundPhase === "drawing" && (
                <GameInfoBar
                  isDrawer={isDrawer}
                  secretWord={secretWord}
                  timeLeft={isWordGuessed ? revealTimer : timeLeft}
                  round={roundInfo.round}
                  totalRounds={roundInfo.totalRounds}
                  isWordGuessed={isWordGuessed}
                />
              )}
              {roundPhase === "results" && (
                <div className="h-14 flex items-center justify-center bg-green-900 rounded-2xl border border-green-700 shadow text-green-100 text-lg">
                  Round Results! Next round in {timeLeft}s
                </div>
              )}
            </>
          ) : (
            <div className="h-14 flex items-center justify-center bg-gray-900 rounded-2xl border border-gray-800 shadow text-gray-300 text-lg">
              Waiting for host to start the game...
            </div>
          )}

          <div className="flex-1 relative bg-white border-2 border-black rounded-2xl shadow-lg">
            {/* Word Choice Overlay */}
            {roundPhase === "choose-word" && isDrawer && wordOptions.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-2xl z-10">
                <div className="bg-white border-2 border-black p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-black mb-4 uppercase">
                    Choose a word to draw:
                  </h3>
                  <div className="flex gap-4">
                    {wordOptions.map((word, index) => (
                      <button
                        key={index}
                        onClick={() => handleWordChoice(word)}
                        className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-full transition uppercase"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Round Results Overlay */}
            {roundPhase === "results" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-2xl z-10">
                <div className="bg-white border-2 border-black p-6 rounded-2xl max-w-md w-full">
                  <h3 className="text-xl font-bold text-black mb-4 uppercase">
                    Round {roundInfo.round} Results
                  </h3>
                  <p className="text-black mb-4 font-bold">
                    Word was: <strong className="text-red-600">{secretWord}</strong>
                  </p>
                  <div className="space-y-2">
                    {roundResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-100 border-2 border-gray-300 p-2 rounded-full"
                      >
                        <span className="text-black font-bold uppercase">{result.username}</span>
                        <span className="text-green-600 font-bold">+{result.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {socketRef.current && (
              <Canvas
                socket={socketRef.current}
                roomId={room.roomId}
                isDrawer={isDrawer && roundPhase === "drawing"}
              />
            )}
            {gameState === "lobby" && isHost && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-2xl">
                <button
                  onClick={handleStartGame}
                  className="px-10 py-5 text-2xl bg-black border-2 border-black rounded-full hover:bg-gray-800 text-white font-bold shadow-lg transition uppercase"
                >
                  Start Game
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-1">
          <ChatBox
            messages={messages}
            systemMessage={systemMessage}
            onSendMessage={handleSendMessage}
            isDrawer={isDrawer && roundPhase === "drawing"}
            isWordGuessed={isWordGuessed}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
