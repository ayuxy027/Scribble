import React from "react";
// Use type-only import to avoid runtime import issues
import type { User, ReadyStatus } from "../../types";

interface PlayerListProps {
  users: User[];
  drawerId: string | null;
  hostId: string;
  myId?: string;
  readyStatus?: ReadyStatus | null;
  showReadyStatus?: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({ 
  users, 
  drawerId, 
  hostId, 
  myId, 
  readyStatus, 
  showReadyStatus = false 
}) => {
  const isUserReady = (userId: string) => {
    if (userId === hostId) return true; // Host is always considered ready
    return readyStatus && Object.prototype.hasOwnProperty.call(readyStatus, userId) ? readyStatus[userId as keyof ReadyStatus] : false;
  };

  return (
    <div className="h-full">
      <ul className="space-y-3">
        {users.map(user => (
          <li
            key={user.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-full transition border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              ${user.id === drawerId 
                ? "bg-black text-white font-black border-black animate-pulse" 
                : user.id === myId 
                  ? "bg-yellow-100 text-black border-black font-black" 
                  : "bg-white text-black border-black hover:bg-gray-50"
              }
            `}
          >
            {user.id === hostId && (
              <span title="Host" className="text-red-600 text-lg">
                ★
              </span>
            )}
            <div className="flex-1">
              <span className="font-black uppercase text-sm">{user.username}</span>
              {user.id === myId && (
                <span className="text-xs ml-2 bg-gray-200 text-black px-2 py-0.5 rounded-full uppercase font-black">
                  You
                </span>
              )}
            </div>
            
            {/* Ready Status for Lobby */}
            {showReadyStatus && (
              <div className="flex items-center gap-2">
                {user.id === hostId ? (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full uppercase font-black">
                    Host
                  </span>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-full uppercase font-black ${
                    isUserReady(user.id)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isUserReady(user.id) ? '✓ Ready' : '⏳ Not Ready'}
                  </span>
                )}
              </div>
            )}
            
            {/* Drawing Status */}
            {user.id === drawerId && (
              <span className="text-yellow-400 font-black animate-bounce">
                ✏️
              </span>
            )}
            
            {/* Score Display (only if not showing ready status) */}
            {!showReadyStatus && (
              <div className="bg-gray-100 border border-black rounded-full px-3 py-1">
                <span className="font-black text-sm">{user.score}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;