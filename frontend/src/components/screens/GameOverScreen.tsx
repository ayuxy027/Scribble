import React from "react";
import type { FinalScores, ReadyStatus } from "../../types";

interface GameOverScreenProps {
  finalScores: FinalScores[];
  isHost: boolean;
  isReady: boolean;
  readyStatus: ReadyStatus | null;
  onStartNewGame: () => void;
  onJoinNewGame: () => void;
  onLeaveRoom: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  finalScores,
  isHost,
  isReady,
  readyStatus,
  onStartNewGame,
  onJoinNewGame,
  onLeaveRoom,
}) => {
  return (
    <div className="min-h-screen bg-[#f5f3ea] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute left-[10%] top-[15%] w-20 h-16 bg-white border-2 border-black rounded-full rotate-12 z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
      </div>
      <div className="absolute right-[15%] top-[25%] w-16 h-12 bg-yellow-100 border-2 border-black rounded-full -rotate-6 z-10"></div>
      <div className="absolute left-[25%] bottom-[15%] w-12 h-12 bg-pink-100 border-2 border-black rounded-full rotate-12 z-10"></div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-6 relative z-20">
        <div className="bg-white border-2 border-black rounded-2xl p-8 max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="bg-black text-white px-8 py-4 rounded-2xl mb-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-4xl font-black uppercase">Game Over!</h1>
            <div className="text-lg font-black mt-2 uppercase">🏁 Final Results 🏁</div>
          </div>

          {/* Final Scores */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-black text-black text-center mb-6 uppercase">
              Final Leaderboard
            </h2>
            {finalScores.map((player, index) => (
              <div
                key={player.username}
                className={`flex justify-between items-center p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  index === 0
                    ? "bg-yellow-200"
                    : index === 1
                    ? "bg-gray-200"
                    : index === 2
                    ? "bg-orange-200"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center font-black">
                    #{index + 1}
                  </div>
                  <div className="text-2xl">
                    {index === 0 && "🏆"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && "🎮"}
                  </div>
                  <span className="font-black text-xl uppercase">{player.username}</span>
                </div>
                <div className="bg-gray-100 border-2 border-black rounded-full px-4 py-2">
                  <span className="text-xl font-black">{player.score} pts</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ready Status */}
          {readyStatus && (
            <div className="mb-6 p-4 bg-gray-100 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-black text-black mb-3 uppercase">Players Ready:</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white border border-black rounded-full px-3 py-1">
                  <span className="font-black text-sm">
                    {readyStatus.readyCount}/{readyStatus.totalPlayers}
                  </span>
                </div>
                <span className="font-black text-sm uppercase">players ready</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Ready: {readyStatus.readyPlayerNames.join(", ") || "None"}
              </div>
              {readyStatus.allReady && isHost && (
                <div className="mt-3 p-2 bg-green-100 border border-green-600 rounded-lg">
                  <div className="text-green-600 text-sm font-black uppercase text-center">
                    ✅ All players ready! You can start the new game.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {isHost ? (
              <button
                onClick={onStartNewGame}
                disabled={!readyStatus?.allReady}
                className={`px-8 py-4 rounded-full text-xl font-black uppercase transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 ${
                  readyStatus?.allReady
                    ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                    : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                }`}
              >
                {readyStatus?.allReady
                  ? "🔄 Start New Game"
                  : "⏳ Waiting for Players..."}
              </button>
            ) : (
              <button
                onClick={onJoinNewGame}
                disabled={isReady}
                className={`px-8 py-4 rounded-full text-xl font-black uppercase transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 ${
                  isReady
                    ? "bg-green-500 text-white border-green-500 cursor-default"
                    : "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                }`}
              >
                {isReady ? "✅ Ready!" : "🎮 Ready for New Game"}
              </button>
            )}
            <button
              onClick={onLeaveRoom}
              className="px-8 py-4 bg-red-500 border-2 border-red-500 rounded-full text-xl font-black uppercase text-white hover:bg-red-600 transition shadow-[4px_4px_0px_0px_rgba(139,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(139,0,0,1)]"
            >
              🚪 Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;