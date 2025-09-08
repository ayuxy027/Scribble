import React from 'react';

interface GameNavigationProps {
  roomId: string;
  onLeaveRoom: () => void;
}

const GameNavigation: React.FC<GameNavigationProps> = ({ roomId, onLeaveRoom }) => {
  return (
    <div className="w-full bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center">
        {/* STAKEBOARD Logo */}
        <div className="bg-black text-white px-4 py-2 rounded-full relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-lg font-black uppercase">STAKEBOARD</h1>
          <div className="absolute -bottom-1 left-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-black"></div>
        </div>
        
        {/* Room Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 border-2 border-black px-3 py-1.5 rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-black font-black uppercase text-sm">
              Room: <span className="text-red-600">{roomId}</span>
            </span>
          </div>
          <button
            onClick={onLeaveRoom}
            className="px-4 py-1.5 bg-red-600 border-2 border-red-600 rounded-full hover:bg-red-700 text-white font-black uppercase transition shadow-[2px_2px_0px_0px_rgba(139,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(139,0,0,1)] text-sm"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameNavigation;
