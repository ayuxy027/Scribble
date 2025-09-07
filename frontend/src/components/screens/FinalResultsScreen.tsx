import React from "react";
import type { FinalScores, RoundInfo } from "../../types";

interface FinalResultsScreenProps {
  finalScores: FinalScores[];
  timeLeft: number;
  roundInfo: RoundInfo;
}

const FinalResultsScreen: React.FC<FinalResultsScreenProps> = ({
  finalScores,
  timeLeft,
  roundInfo,
}) => {
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
};

export default FinalResultsScreen;