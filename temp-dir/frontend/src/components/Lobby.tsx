import React, { useState } from "react";

interface LobbyProps {
  onSetUsername: (username: string) => void;
  username?: string;
  onCreateRoom?: () => void;
  onJoinRoom?: (roomId: string) => void;
  error?: string;
}

const Lobby: React.FC<LobbyProps> = ({ onSetUsername, username, onCreateRoom, onJoinRoom, error }) => {
  const [name, setName] = useState(username || "");
  const [roomId, setRoomId] = useState("");

  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSetUsername(name.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (onJoinRoom && roomId.trim()) onJoinRoom(roomId.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <h1 className="text-5xl font-extrabold text-blue-400 mb-6 drop-shadow-lg">ScribbleChain</h1>
      {!username ? (
        <form onSubmit={handleSetName} className="flex flex-col gap-6 bg-gray-900 p-10 rounded-2xl shadow-xl w-80">
          <input
            className="px-4 py-3 rounded-lg text-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={16}
            autoFocus
          />
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white text-lg font-semibold transition" type="submit" disabled={!name.trim()}>
            Continue
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-6 bg-gray-900 p-10 rounded-2xl shadow-xl w-80">
          <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white text-lg font-semibold transition" onClick={onCreateRoom}>
            Create Room
          </button>
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              className="px-4 py-3 rounded-lg text-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter Room Code"
              value={roomId}
              onChange={e => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg text-white text-lg font-semibold transition" type="submit" disabled={!roomId.trim()}>
              Join Room
            </button>
          </form>
          {error && <div className="text-red-400 text-center mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
};
export default Lobby;