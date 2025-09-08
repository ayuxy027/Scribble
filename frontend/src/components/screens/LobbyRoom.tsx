import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import type { RoomState, Message, ReadyStatus, ClientToServerEvents, ServerToClientEvents } from '../../types';
import PlayerList from '../game/PlayerList';
import ChatBox from '../game/ChatBox';
import GameNavigation from '../game/GameNavigation';

interface LobbyRoomProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  room: RoomState;
  messages: Message[];
  readyStatus: ReadyStatus | null;
  isHost: boolean;
  isReady: boolean;
  onLeaveRoom: () => void;
  onStartGame: () => void;
  onSendMessage: (message: string) => void;
  onToggleReady: () => void;
}

const LobbyRoom: React.FC<LobbyRoomProps> = ({
  socket,
  room,
  messages,
  readyStatus,
  isHost,
  isReady,
  onLeaveRoom,
  onStartGame,
  onSendMessage,
  onToggleReady,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const allPlayersReady = room.users.every(user => {
    if (user.id === room.hostId) return true; // Host is always ready
    return readyStatus && Object.prototype.hasOwnProperty.call(readyStatus, user.id) 
      ? readyStatus[user.id as keyof ReadyStatus] 
      : false;
  });

  const canStartGame = isHost && room.users.length >= 2 && allPlayersReady;

  return (
    <div className="min-h-screen bg-[#f5f3ea] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute left-[8%] top-[10%] w-16 h-12 bg-white border-2 border-black rounded-full rotate-12 z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
      </div>
      <div className="absolute right-[12%] top-[15%] w-12 h-12 bg-pink-100 border-2 border-black rounded-full -rotate-6 z-10"></div>
      <div className="absolute left-[20%] bottom-[10%] w-10 h-10 bg-gray-200 border-2 border-black rounded-full rotate-45 z-10"></div>

      {/* Main Content */}
      <main className="relative z-20 p-4 min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          {/* Navigation */}
          <div className="mb-4">
            <GameNavigation roomId={room.roomId} onLeaveRoom={onLeaveRoom} />
          </div>

          {/* Lobby Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
            {/* Left Sidebar - Players */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-full">
                <div className="text-sm font-black mb-3 uppercase flex items-center justify-between">
                  <span>Players ({room.users.length})</span>
                  {!isHost && (
                    <button
                      onClick={onToggleReady}
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                        isReady
                          ? 'bg-green-600 text-white border-2 border-green-600'
                          : 'bg-gray-200 text-black border-2 border-black hover:bg-gray-300'
                      }`}
                    >
                      {isReady ? '✓ Ready' : 'Not Ready'}
                    </button>
                  )}
                </div>
                <PlayerList
                  users={room.users}
                  drawerId={null}
                  hostId={room.hostId}
                  myId={socket.id || ""}
                  readyStatus={readyStatus}
                  showReadyStatus={true}
                />
              </div>
            </div>

            {/* Center - Lobby Actions */}
            <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-4">
              <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-center">
                  <h2 className="text-2xl font-black text-black mb-4 uppercase">Game Lobby</h2>
                  
                  {/* Room Code Section */}
                  <div className="bg-gray-100 border-2 border-black rounded-xl p-4 mb-6">
                    <div className="text-sm font-black text-gray-600 mb-2 uppercase">Room Code</div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-3xl font-black text-red-600 tracking-widest">
                        {room.roomId}
                      </div>
                      {isHost && (
                        <button
                          onClick={handleCopyRoomCode}
                          className={`px-3 py-2 rounded-full text-sm font-black uppercase transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                            copiedCode
                              ? 'bg-green-600 text-white border-2 border-green-600'
                              : 'bg-black text-white border-2 border-black hover:bg-gray-800'
                          }`}
                        >
                          {copiedCode ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Game Status */}
                  <div className="mb-6">
                    {isHost ? (
                      <div>
                        <div className="text-lg font-black text-black mb-3 uppercase">Host Controls</div>
                        <div className="text-sm text-gray-600 mb-4">
                          {room.users.length < 2 ? (
                            "⚠️ Need at least 2 players to start"
                          ) : !allPlayersReady ? (
                            "⏳ Waiting for all players to be ready..."
                          ) : (
                            "🎮 All players ready! You can start the game."
                          )}
                        </div>
                        <button
                          onClick={onStartGame}
                          disabled={!canStartGame}
                          className={`px-8 py-3 rounded-full text-lg font-black uppercase transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            canStartGame
                              ? 'bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 hover:shadow-[1px_1px_0px_0px_rgba(34,197,94,1)]'
                              : 'bg-gray-300 text-gray-500 border-2 border-gray-300 cursor-not-allowed'
                          }`}
                        >
                          🚀 Start Game
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg font-black text-black mb-3 uppercase">Player Status</div>
                        <div className="text-sm text-gray-600 mb-4">
                          {isReady ? (
                            "✅ You are ready! Waiting for host to start the game..."
                          ) : (
                            "❌ Click 'Ready' when you're ready to play!"
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Status Summary */}
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-3">
                    <div className="text-sm font-black text-blue-800 mb-2 uppercase">Game Info</div>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>👥 Players: {room.users.length} (Min: 2, Max: 8)</div>
                      <div>⏱️ Round Time: 60 seconds</div>
                      <div>🎯 Rounds: 3 rounds total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Chat */}
            <div className="lg:col-span-3 order-3 lg:order-3">
              <div className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-full overflow-hidden">
                <div className="text-sm font-black p-3 border-b-2 border-black uppercase bg-white">Lobby Chat</div>
                <ChatBox
                  messages={messages}
                  systemMessage=""
                  onSendMessage={onSendMessage}
                  isDrawer={false}
                  isWordGuessed={false}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LobbyRoom;
