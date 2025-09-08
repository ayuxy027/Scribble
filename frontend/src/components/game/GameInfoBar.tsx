import React from 'react';

interface GameInfoBarProps {
  isDrawer: boolean;
  secretWord: string;
  timeLeft: number;
  round: number;
  totalRounds: number;
  isWordGuessed: boolean;
  revealedChars?: number[]; // Array of character indices that have been revealed
}

const GameInfoBar: React.FC<GameInfoBarProps> = ({ 
  isDrawer, 
  secretWord, 
  timeLeft, 
  round, 
  totalRounds, 
  isWordGuessed,
  revealedChars = []
}) => {
  const showWord = isDrawer || isWordGuessed;
  
  // Enhanced word display with better spacing and character reveals
  const formatWordDisplay = (word: string, revealed: boolean, revealedIndices: number[] = []) => {
    if (!word) return '...';
    if (revealed) {
      return word.toUpperCase().split('').join(' ');
    }
    
    // Show revealed characters and underscores
    return word
      .split('')
      .map((char, index) => {
        if (char === ' ') return '  '; // Space between words
        if (revealedIndices.includes(index)) {
          return char.toUpperCase();
        }
        return '_';
      })
      .join(' ');
  };
  
  const wordDisplay = formatWordDisplay(secretWord, showWord, revealedChars);
  const wordLength = secretWord.replace(/\s/g, '').length; // Count without spaces
  
  return (
    <div className="flex justify-between items-center w-full bg-white border-2 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Round Info */}
      <div className="bg-gray-100 border-2 border-black rounded-full px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-sm font-black text-black text-center uppercase">
          Round {round} / {totalRounds}
        </div>
      </div>
      
      {/* Word Display - Enhanced with character count */}
      <div className="flex-1 mx-4">
        <div className={`border-2 border-black rounded-2xl p-4 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ${
          showWord ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
          <div className={`text-xl font-black tracking-[0.3em] text-black select-none uppercase transition-all duration-300 ${
            showWord ? 'scale-105' : 'scale-100'
          }`}>
            {/* Render word with highlighted revealed characters */}
            {showWord ? (
              wordDisplay
            ) : (
              <span>
                {secretWord
                  .split('')
                  .map((char: string, index: number) => {
                    if (char === ' ') return <span key={index}>&nbsp;&nbsp;</span>;
                    if (revealedChars.includes(index)) {
                      return (
                        <span key={index} className="text-blue-600 bg-blue-100 px-1 rounded animate-pulse">
                          {char.toUpperCase()}
                        </span>
                      );
                    }
                    return <span key={index}>_</span>;
                  })
                  .reduce((prev: React.ReactNode[], curr: React.ReactNode, index: number) => {
                    if (index === 0) return [curr];
                    return [...prev, <span key={`space-${index}`}>&nbsp;</span>, curr];
                  }, [] as React.ReactNode[])}
              </span>
            )}
          </div>
          
          {/* Character count display */}
          {!showWord && (
            <div className="text-xs font-black text-gray-500 mt-2 uppercase">
              {wordLength} character{wordLength !== 1 ? 's' : ''}
              {revealedChars.length > 0 && (
                <span className="text-blue-600 animate-pulse">
                  {" • "}{revealedChars.length} hint{revealedChars.length !== 1 ? 's' : ''} revealed! 💡
                </span>
              )}
            </div>
          )}
          
          {isDrawer && (
            <div className="text-xs font-black text-gray-600 mt-1 uppercase">
              Your word to draw
            </div>
          )}
          {isWordGuessed && !isDrawer && (
            <div className="text-xs font-black text-green-600 mt-1 uppercase animate-pulse">
              ✅ Word guessed correctly!
            </div>
          )}
          {!showWord && revealedChars.length === 0 && (
            <div className="text-xs font-black text-gray-600 mt-1 uppercase">
              Guess the word
            </div>
          )}
        </div>
      </div>
      
      {/* Timer */}
      <div className={`border-2 border-black rounded-full px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
        timeLeft <= 10 ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
      }`}>
        <div className="text-lg font-black text-black text-center flex items-center gap-2">
          <span className="text-sm">{timeLeft <= 10 ? '⚠️' : '⏰'}</span>
          <span>{timeLeft}s</span>
        </div>
      </div>
    </div>
  );
};
export default GameInfoBar;