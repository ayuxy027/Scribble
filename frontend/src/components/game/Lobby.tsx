import React, { useState } from "react";
import Panda from "./Panda";

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
    <div className="flex flex-col items-center justify-center h-screen gap-8 bg-white">
      <div className="bg-black text-white px-6 py-3 rounded-full mb-6 relative">
        <h1 className="text-4xl font-bold">STAKEBOARD</h1>
        <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6">
          <Panda size="sm" />
        </div>
      </div>
      {!username ? (
        <form onSubmit={handleSetName} className="flex flex-col gap-6 bg-white border-2 border-black p-10 rounded-2xl shadow-xl w-80">
          <input
            className="px-4 py-3 rounded-full text-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={16}
            autoFocus
          />
          <button className="bg-black hover:bg-gray-800 px-6 py-3 rounded-full text-white text-lg font-bold uppercase transition" type="submit" disabled={!name.trim()}>
            Continue
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-6 bg-white border-2 border-black p-10 rounded-2xl shadow-xl w-80">
          <button className="bg-black hover:bg-gray-800 px-6 py-3 rounded-full text-white text-lg font-bold uppercase transition" onClick={onCreateRoom}>
            Create Room
          </button>
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              className="px-4 py-3 rounded-full text-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter Room Code"
              value={roomId}
              onChange={e => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button className="border-2 border-black hover:bg-black hover:text-white px-6 py-3 rounded-full text-black text-lg font-bold uppercase transition bg-white" type="submit" disabled={!roomId.trim()}>
              Join Room
            </button>
          </form>
          {error && <div className="text-red-600 text-center mt-2 font-bold">{error}</div>}
        </div>
      )}
    </div>
  );
};
export default Lobby;