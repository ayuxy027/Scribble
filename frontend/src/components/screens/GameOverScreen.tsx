import React from "react";
import type { FinalScores, ReadyStatus } from "../../types";
import Panel from "../design/Panel";
import Button from "../design/Button";

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
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <Panel>
        <div className="bg-black text-white px-6 py-3 rounded-full mb-8 text-center">
          <h1 className="text-3xl font-bold uppercase">Game Over!</h1>
        </div>
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-200 text-center mb-4">
            Final Scores
          </h2>
          {finalScores.map((player, index) => (
            <div
              key={player.username}
              className={`flex justify-between items-center p-3 rounded-lg ${
                index === 0
                  ? "bg-yellow-600 text-yellow-100"
                  : index === 1
                  ? "bg-gray-600 text-gray-100"
                  : index === 2
                  ? "bg-amber-700 text-amber-100"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
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

        {readyStatus && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Players Ready:</h3>
            <div className="text-sm text-gray-300 mb-2">
              {readyStatus.readyCount}/{readyStatus.totalPlayers} players ready
            </div>
            <div className="text-xs text-gray-400">
              Ready: {readyStatus.readyPlayerNames.join(", ") || "None"}
            </div>
            {readyStatus.allReady && isHost && (
              <div className="mt-2 text-green-400 text-sm font-semibold">
                ✅ All players ready! You can start the new game.
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isHost ? (
            <Button
              variant="success"
              onClick={onStartNewGame}
              disabled={!readyStatus?.allReady}
            >
              {readyStatus?.allReady
                ? "🔄 Start New Game"
                : "⏳ Waiting for Players..."}
            </Button>
          ) : (
            <Button
              variant={isReady ? "success" : "primary"}
              onClick={onJoinNewGame}
              disabled={isReady}
              className={isReady ? "cursor-default" : ""}
            >
              {isReady ? "✅ Ready!" : "🎮 Ready for New Game"}
            </Button>
          )}
          <Button variant="danger" onClick={onLeaveRoom}>
            🚪 Leave Room
          </Button>
        </div>
      </Panel>
    </div>
  );
};

export default GameOverScreen;