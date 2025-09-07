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
    <div className="flex justify-between items-center w-full bg-white border-2 border-black p-3 rounded-full h-14 shadow">
      <div className="text-lg font-bold text-black w-1/4 text-center tracking-wide uppercase">Round {round} / {totalRounds}</div>
      <div className="text-2xl font-mono tracking-[0.25em] text-black w-1/2 text-center select-none font-bold">
        {wordDisplay.split('').join(' ')}
      </div>
      <div className="text-2xl font-bold text-black w-1/4 text-center flex items-center justify-center gap-2">
        <span className="animate-pulse">⏰</span> {timeLeft}
      </div>
    </div>
  );
};
export default GameInfoBar;