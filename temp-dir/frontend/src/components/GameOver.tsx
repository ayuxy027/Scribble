import React from "react";

interface GameOverProps {
  scores: { username: string; score: number }[];
  onLeave: () => void;
  onStartNewGame?: () => void;
  onJoinNewGame?: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ scores, onLeave, onStartNewGame, onJoinNewGame }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">Game Over!</h1>
        
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-200 text-center mb-4">Final Scores</h2>
          {scores.map((player, index) => (
            <div key={player.username} className={`flex justify-between items-center p-3 rounded-lg ${
              index === 0 ? 'bg-yellow-600 text-yellow-100' : 
              index === 1 ? 'bg-gray-600 text-gray-100' : 
              index === 2 ? 'bg-amber-700 text-amber-100' : 
              'bg-gray-700 text-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">#{index + 1}</span>
                {index === 0 && <span>🏆</span>}
                {index === 1 && <span>🥈</span>}
                {index === 2 && <span>🥉</span>}
                <span className="font-semibold">{player.username}</span>
              </div>
              <span className="text-lg font-bold">{player.score} pts</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {onStartNewGame && (
            <button
              onClick={onStartNewGame}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              🔄 Start New Game
            </button>
          )}
          
          {onJoinNewGame && (
            <button
              onClick={onJoinNewGame}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              ✅ Ready for New Game
            </button>
          )}
          
          <button
            onClick={onLeave}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            🚪 Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;