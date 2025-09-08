import React, { useEffect } from "react";
import type { FinalScores, RoundInfo } from "../../types";

interface FinalResultsScreenProps {
  finalScores: FinalScores[];
  timeLeft: number;
  roundInfo: RoundInfo;
  onReturnToLobby: () => void;
}

const FinalResultsScreen: React.FC<FinalResultsScreenProps> = ({
  finalScores,
  timeLeft,
  roundInfo,
  onReturnToLobby,
}) => {
  // Auto-redirect to lobby after timer expires
  useEffect(() => {
    if (timeLeft <= 0) {
      onReturnToLobby();
    }
  }, [timeLeft, onReturnToLobby]);
  return (
    <div className="min-h-screen bg-[#f5f3ea] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute left-[8%] top-[12%] w-24 h-18 bg-white border-2 border-black rounded-full rotate-12 z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-2xl">🎉</div>
        </div>
      </div>
      <div className="absolute right-[12%] top-[20%] w-20 h-16 bg-yellow-100 border-2 border-black rounded-full -rotate-6 z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-xl">🏆</div>
        </div>
      </div>
      <div className="absolute left-[20%] bottom-[12%] w-16 h-14 bg-pink-100 border-2 border-black rounded-full rotate-45 z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-lg">✨</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-6 relative z-20">
        <div className="bg-white border-2 border-black rounded-2xl p-8 max-w-3xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-black text-white px-8 py-4 rounded-2xl mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h1 className="text-4xl font-black uppercase">🎉 Game Complete! 🎉</h1>
            </div>
            <p className="text-xl font-black text-gray-600 uppercase">
              All {roundInfo.totalRounds} rounds completed!
            </p>
          </div>

          {/* Final Standings */}
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl font-black text-black text-center mb-6 uppercase">
              🏆 Final Standings 🏆
            </h2>
            {Array.isArray(finalScores) && finalScores.length > 0 ? (
              finalScores.map((player, index) => (
                <div
                  key={player.username}
                  className={`flex justify-between items-center p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-200 to-yellow-300"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-200 to-gray-300"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-200 to-orange-300"
                      : "bg-gradient-to-r from-white to-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl">
                      #{index + 1}
                    </div>
                    <div className="text-3xl">
                      {index === 0 && "👑"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                      {index > 2 && "🎮"}
                    </div>
                    <span className="text-2xl font-black uppercase">{player.username}</span>
                    {index === 0 && (
                      <div className="bg-yellow-400 border-2 border-black rounded-full px-3 py-1 animate-pulse">
                        <span className="font-black text-sm uppercase">WINNER!</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-100 border-2 border-black rounded-full px-6 py-2">
                    <span className="text-2xl font-black">{player.score} pts</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-100 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-black font-black uppercase">No final scores available</p>
              </div>
            )}
          </div>

          {/* Countdown Timer & Return Button */}
          <div className="text-center">
            <div className="bg-gray-100 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
              <p className="text-xl font-black text-gray-600 mb-4 uppercase">
                Returning to main menu in {timeLeft} seconds...
              </p>
              <div className="w-full bg-white border-2 border-black rounded-full h-6 overflow-hidden mb-4">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-1000 flex items-center justify-center"
                  style={{ width: `${(timeLeft / 10) * 100}%` }}
                >
                  <span className="text-white font-black text-sm">
                    {timeLeft > 0 && "⏰"}
                  </span>
                </div>
              </div>
              <button
                onClick={onReturnToLobby}
                className="px-8 py-3 bg-black border-2 border-black rounded-full hover:bg-gray-800 text-white font-black uppercase transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                🏠 Return to Main Menu Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalResultsScreen;