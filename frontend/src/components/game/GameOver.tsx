import React from "react";
import Panda from "./Panda";

interface GameOverProps {
  scores: { username: string; score: number }[];
  onLeave: () => void;
  onStartNewGame?: () => void;
  onJoinNewGame?: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ scores, onLeave, onStartNewGame, onJoinNewGame }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <div className="bg-white border-2 border-black rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="bg-black text-white px-6 py-3 rounded-full mb-8 text-center relative">
          <h1 className="text-3xl font-bold uppercase">Game Over!</h1>
          <div className="absolute -top-2 -right-2 w-6 h-6">
            <Panda size="sm" />
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-black text-center mb-4 uppercase">Final Scores</h2>
          {scores.map((player, index) => (
            <div key={player.username} className={`flex justify-between items-center p-3 rounded-full border-2 ${
              index === 0 ? 'bg-yellow-300 border-yellow-500 text-black' : 
              index === 1 ? 'bg-gray-200 border-gray-400 text-black' : 
              index === 2 ? 'bg-orange-200 border-orange-400 text-black' : 
              'bg-white border-black text-black'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">#{index + 1}</span>
                {index === 0 && <span>🏆</span>}
                {index === 1 && <span>🥈</span>}
                {index === 2 && <span>🥉</span>}
                <span className="font-bold uppercase">{player.username}</span>
              </div>
              <span className="text-lg font-bold">{player.score} pts</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {onStartNewGame && (
            <button
              onClick={onStartNewGame}
              className="w-full px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-full transition-colors uppercase"
            >
              🔄 Start New Game
            </button>
          )}
          
          {onJoinNewGame && (
            <button
              onClick={onJoinNewGame}
              className="w-full px-6 py-3 border-2 border-black hover:bg-black hover:text-white text-black font-bold rounded-full transition-colors bg-white uppercase"
            >
              ✅ Ready for New Game
            </button>
          )}
          
          <button
            onClick={onLeave}
            className="w-full px-6 py-3 border-2 border-red-600 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors uppercase"
          >
            🚪 Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;