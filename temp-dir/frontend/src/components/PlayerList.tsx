import React from "react";
// Use type-only import to avoid runtime import issues
import type { User } from "../App";

interface PlayerListProps {
  users: User[];
  drawerId: string | null;
  hostId: string;
  myId?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ users, drawerId, hostId, myId }) => (
  <div className="bg-gray-900 rounded-2xl p-5 h-full shadow-lg border border-gray-800">
    <h2 className="text-xl font-bold mb-4 text-blue-300 tracking-wide">Players</h2>
    <ul className="space-y-3">
      {users.map(user => (
        <li
          key={user.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition
            ${user.id === drawerId ? "bg-yellow-700/80 text-yellow-100 font-bold shadow" : user.id === myId ? "bg-blue-900/80 text-blue-200" : "bg-gray-800/80 text-white"}
          `}
        >
          {user.id === hostId && <span title="Host" className="text-pink-400">★</span>}
          <span className="font-semibold">{user.username}</span>
          {user.id === myId && <span className="text-xs text-blue-300 ml-1">(You)</span>}
          {user.id === drawerId && <span className="ml-auto text-yellow-300 font-bold animate-pulse">✏️ Drawing</span>}
          <span className="ml-auto font-mono text-lg">{user.score}</span>
        </li>
      ))}
    </ul>
  </div>
);
export default PlayerList;