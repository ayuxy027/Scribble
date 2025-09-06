

// --- Interfaces (exported for Canvas) ---
export interface User {
    id: string;
    username: string;
    progress: any;
}
export interface RoomState {
    roomId: string;
    users: User[];
    hostId: string;
    locked: boolean;
}
export interface ServerToClientEvents {
    "room-update": (roomState: RoomState) => void;
    "room-closed": () => void;
    "rejoin-success": (data: { roomId: string; progress: any }) => void;
    "task-started": () => void;
    "progress-update": (data: { userId: string; progress: any }) => void;
    error: (msg: string) => void;
    "canvas-cleared": () => void;
    "canvas-state": (fullHistory: any[][]) => void;
}
export interface ClientToServerEvents {
    "create-room": (username:string) => void;
    "join-room": (roomId: string, username: string) => void;
    "rejoin-room": (roomId: string, username: string, oldSocketId: string | null) => void;
    "update-progress": (progress: any) => void;
    "start-task": (roomId: string) => void;
    "leave-room": () => void;
    "clear-canvas": (roomId: string) => void;
    // --- CHANGE: Added the new canvas state update event ---
    "canvas-state-update": (data: { roomId: string, history: any[][] }) => void;
}

const SERVER_URL = "http://localhost:4000";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Canvas from "./Canvas"; // Adjust path if needed

// --- Interfaces (exported for Canvas) ---
export interface User {
    id: string;
    username: string;
    progress: any;
}
export interface RoomState {
    roomId: string;
    users: User[];
    hostId: string;
    locked: boolean;
}
export interface ServerToClientEvents {
    "room-update": (roomState: RoomState) => void;
    "room-closed": () => void;
    "rejoin-success": (data: { roomId: string; progress: any }) => void;
    "task-started": () => void;
    "progress-update": (data: { userId: string; progress: any }) => void;
    error: (msg: string) => void;
    "canvas-cleared": () => void;
    "canvas-state": (fullHistory: any[][]) => void;
}
export interface ClientToServerEvents {
    "create-room": (username:string) => void;
    "join-room": (roomId: string, username: string) => void;
    "rejoin-room": (roomId: string, username: string, oldSocketId: string | null) => void;
    "update-progress": (progress: any) => void;
    "start-task": (roomId: string) => void;
    "leave-room": () => void;
    "clear-canvas": (roomId: string) => void;
    "canvas-state-update": (data: { roomId: string, history: any[][] }) => void;
}

const App: React.FC = () => {
    const [username, setUsername] = useState<string>(() => localStorage.getItem("username") || "");
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [room, setRoom] = useState<RoomState | null>(null);
    const [joinInput, setJoinInput] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userProgress, setUserProgress] = useState<any>({});
    const [gameState, setGameState] = useState<string>("waiting");

    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

    const clearSession = () => {
        localStorage.removeItem("roomId");
        localStorage.removeItem("socketId");
        setRoom(null);
        setUserProgress({});
        setGameState("waiting");
        setIsLoading(false);
        setError("");
        setMessage("");
    };

    const updateProgress = (newProgress: any) => {
        setUserProgress(newProgress);
        socketRef.current?.emit('update-progress', newProgress);
    };

    useEffect(() => {
        if (!username) return;

        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL);
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log('Connected:', socket.id);
            const prevRoomId = localStorage.getItem("roomId");
            const oldSocketId = localStorage.getItem("socketId");
            localStorage.setItem("socketId", socket.id);

            if (prevRoomId) {
                console.log('Attempting to rejoin room:', prevRoomId);
                setIsLoading(true);
                setMessage("Rejoining previous room...");
                socket.emit("rejoin-room", prevRoomId, username, oldSocketId);
            }
        });

        socket.on("room-update", (roomState) => {
            setRoom(roomState);
            localStorage.setItem("roomId", roomState.roomId);

            // --- THIS IS THE FIX ---
            // If the room state from the server says it's locked, it means
            // the task is in progress. Sync our local gameState to match it.
            if (roomState.locked) {
                setGameState("playing");
            }
            // --- END OF FIX ---

            const currentUser = roomState.users.find(u => u.id === socket.id);
            if (currentUser?.progress) {
                setUserProgress(currentUser.progress);
            }
            setError("");
            setIsLoading(false);
            setMessage("");
        });


        socket.on("rejoin-success", (data) => {
            console.log('Rejoin successful:', data);
            setUserProgress(data.progress || {});
            setMessage("Rejoined with previous progress!");
            setIsLoading(false);
        });

        socket.on("task-started", () => {
            setGameState("playing");
            setMessage("Task started!");
        });

        socket.on("progress-update", (data) => {
            console.log(`User ${data.userId} updated progress:`, data.progress);
            setRoom((prevRoom) => {
                if (!prevRoom) return null;
                const updatedUsers = prevRoom.users.map(user => {
                    if (user.id === data.userId) {
                        return { ...user, progress: data.progress };
                    }
                    return user;
                });
                return { ...prevRoom, users: updatedUsers };
            });
        });


        socket.on("room-closed", () => {
            clearSession();
            setMessage("Room was closed by host");
        });

        socket.on("error", (msg) => {
            setError(msg);
            setIsLoading(false);
            if (msg.includes('no longer exists')) {
                clearSession();
            }
        });

        return () => socket.disconnect();
    }, [username]);

    const leaveRoom = () => {
        socketRef.current?.emit('leave-room');
        socketRef.current?.disconnect();
        setRoom(null);
        clearSession();
        setMessage("You left the room");
        window.location.reload();
    };

    const handleSetUsername = () => {
        const name = usernameInput.trim();
        if (name) {
            setUsername(name);
            localStorage.setItem("username", name);
            setUsernameInput("");
        }
    };

    const handleCreateRoom = () => {
        setIsLoading(true);
        setError("");
        setMessage("");
        socketRef.current?.emit("create-room", username);
    };

    const handleJoinRoom = () => {
        if (!joinInput.trim()) return;
        setIsLoading(true);
        setError("");
        setMessage("");
        socketRef.current?.emit("join-room", joinInput.trim().toUpperCase(), username);
    };

    const handleStartTask = () => {
        if (room) {
            socketRef.current?.emit("start-task", room.roomId);
            setGameState("playing");
        }
    };

    const simulateProgress = () => {
        const newProgress = {
            score: (userProgress.score || 0) + 10,
            level: Math.floor(((userProgress.score || 0) + 10) / 50) + 1,
            achievements: userProgress.achievements || [],
            lastAction: Date.now()
        };
        updateProgress(newProgress);
    };


    // --- JSX (No changes below this line) ---

    if (!username) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                <div className="w-full max-w-sm p-6 bg-gray-800 rounded-xl">
                    <h2 className="text-2xl font-bold text-center mb-4">Enter Your Name</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
                            placeholder="Username"
                            className="flex-1 px-3 py-2 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={handleSetUsername}
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const renderLobby = () => (
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-xl">
            <h2 className="text-2xl font-bold text-center mb-4">Welcome, {username}</h2>
            <div className="space-y-3">
                <button
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-500"
                >
                    {isLoading ? "Creating..." : "Create Room"}
                </button>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={joinInput}
                        onChange={(e) => setJoinInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                        placeholder="Room Code"
                        className="flex-1 px-3 py-2 bg-gray-700 rounded"
                    />
                    <button
                        onClick={handleJoinRoom}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-500"
                    >
                        Join
                    </button>
                </div>
            </div>
            {error && <p className="text-red-400 text-center mt-3">{error}</p>}
            {message && <p className="text-yellow-400 text-center mt-3">{message}</p>}
            <div className="text-center mt-4">
                <button
                    onClick={() => {
                        setUsername("");
                        localStorage.removeItem("username");
                        clearSession();
                    }}
                    className="text-blue-400 text-sm underline"
                >
                    Change Username
                </button>
            </div>
        </div>
    );

    const renderRoom = () => {
        if (!room) return null;
        const isHost = socketRef.current?.id === room.hostId;
        const currentUser = room.users.find(u => u.id === socketRef.current?.id);

        return (
            <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Room: {room.roomId}</h2>
                        {isHost && <p className="text-yellow-400 text-sm">👑 You are host</p>}
                    </div>
                    <button
                        onClick={leaveRoom}
                        className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
                    >
                        Leave
                    </button>
                </div>

                {message && (
                    <div className="bg-blue-900/30 border border-blue-500 rounded p-3 mb-4 text-center">
                        <p className="text-blue-400">{message}</p>
                    </div>
                )}

                {room.locked && (
                    <div className="bg-green-900/30 border border-green-500 rounded p-3 mb-4 text-center">
                        <p className="text-green-400 font-bold">Task in Progress</p>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 bg-gray-700 rounded-lg p-4 min-h-[400px] flex">
                        {/* --- 3. REPLACE TASK AREA WITH CANVAS --- */}
                        {gameState === "playing" && socketRef.current ? (
                            <Canvas
                                socket={socketRef.current}
                                roomId={room.roomId}
                                isHost={isHost}
                            />
                        ) : (
                            <div className="text-center w-full self-center">
                                {/* This is the content shown before the task starts */}
                                <h3 className="text-lg font-bold mb-4">Demo Task Area</h3>
                                {gameState === "waiting" && !room.locked && (
                                    <>
                                        <p className="text-gray-400 mb-4">Ready to start?</p>
                                        {isHost && (
                                            <button
                                                onClick={handleStartTask}
                                                className="px-6 py-2 bg-green-600 rounded hover:bg-green-700"
                                            >
                                                Start Task
                                            </button>
                                        )}
                                        {!isHost && <p className="text-gray-400">Waiting for host...</p>}
                                    </>
                                )}
                                {gameState === "completed" && (
                                    <div className="text-green-400">
                                        <p className="text-xl">🎉 Task Completed!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4">
                        <h3 className="font-bold mb-3">Players ({room.users.length})</h3>
                        <div className="space-y-2">
                            {room.users.map(user => (
                                <div key={user.id} className="text-sm">
                                    <div className="flex items-center">
                                        <span className="mr-2">{user.id === room.hostId ? '👑' : '👤'}</span>
                                        <span>{user.username}</span>
                                        {user.id === socketRef.current?.id && (
                                            <span className="text-blue-400 ml-2">(You)</span>
                                        )}
                                    </div>
                                    {user.progress?.score && (
                                        <div className="text-xs text-gray-400 ml-6">
                                            Score: {user.progress.score}
                                            {user.progress.completed && ' ✅'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
                            <p>Room: {room.roomId}</p>
                            <p>Status: {room.locked ? "Active" : "Waiting"}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            {room ? renderRoom() : renderLobby()}
        </div>
    );
};

export default App;