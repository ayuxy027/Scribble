import React from "react";
// Use type-only import to avoid runtime import issues
import type { User } from "../GamePage";

interface PlayerListProps {
  users: User[];
  drawerId: string | null;
  hostId: string;
  myId?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ users, drawerId, hostId, myId }) => (
  <div className="bg-white border-2 border-black rounded-2xl p-5 h-full shadow-lg">
    <h2 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">Players</h2>
    <ul className="space-y-3">
      {users.map(user => (
        <li
          key={user.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition border-2
            ${user.id === drawerId ? "bg-black text-white font-bold border-black" : user.id === myId ? "bg-gray-100 text-black border-black" : "bg-white text-black border-gray-300"}
          `}
        >
          {user.id === hostId && <span title="Host" className="text-red-600">★</span>}
          <span className="font-bold uppercase">{user.username}</span>
          {user.id === myId && <span className="text-xs text-gray-600 ml-1 uppercase">(You)</span>}
          {user.id === drawerId && <span className="ml-auto text-yellow-400 font-bold animate-pulse">✏️ Drawing</span>}
          <span className="ml-auto font-mono text-lg font-bold">{user.score}</span>
        </li>
      ))}
    </ul>
  </div>
);
export default PlayerList;