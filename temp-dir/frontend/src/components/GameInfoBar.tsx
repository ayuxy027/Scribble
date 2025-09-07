import React from 'react';

interface GameInfoBarProps {
  isDrawer: boolean;
  secretWord: string;
  timeLeft: number;
  round: number;
  totalRounds: number;
  isWordGuessed: boolean;
}

const GameInfoBar: React.FC<GameInfoBarProps> = ({ isDrawer, secretWord, timeLeft, round, totalRounds, isWordGuessed }) => {
  const showWord = isDrawer || isWordGuessed;
  const wordDisplay = showWord ? secretWord : (secretWord ? secretWord.replace(/\w/g, '_') : '...');
  return (
    <div className="flex justify-between items-center w-full bg-gradient-to-r from-gray-900 to-gray-800 p-3 rounded-2xl h-14 shadow border border-gray-700">
      <div className="text-lg font-bold text-gray-300 w-1/4 text-center tracking-wide">Round {round} / {totalRounds}</div>
      <div className="text-2xl font-mono tracking-[0.25em] text-yellow-300 w-1/2 text-center select-none">
        {wordDisplay.split('').join(' ')}
      </div>
      <div className="text-2xl font-bold text-gray-300 w-1/4 text-center flex items-center justify-center gap-2">
        <span className="animate-pulse">⏰</span> {timeLeft}
      </div>
    </div>
  );
};
export default GameInfoBar;