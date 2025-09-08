import React from 'react';
import { Socket } from 'socket.io-client';
import type { ClientToServerEvents, Message, RoomState, RoundInfo, ServerToClientEvents } from '../../types';

// Import your existing components
import PlayerList from '../game/PlayerList';
import GameInfoBar from '../game/GameInfoBar';
import Canvas from '../game/Canvas';
import ChatBox from '../game/ChatBox';
import GameNavigation from '../game/GameNavigation';

// Define Props
interface GameRoomProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    room: RoomState;
    gameState: "lobby" | "playing";
    roundPhase: "choose-word" | "drawing" | "results" | null;
    isDrawer: boolean;
    isHost: boolean;
    currentDrawerId: string | null;
    drawerName: string;
    timeLeft: number;
    secretWord: string;
    roundInfo: RoundInfo;
    isWordGuessed: boolean;
    revealTimer: number;
    revealedChars: number[];
    wordOptions: string[];
    roundResults: any[];
    messages: Message[];
    systemMessage: string;
    hintNotification: string;
    onHandleLeaveRoom: () => void;
    onHandleStartGame: () => void;
    onHandleWordChoice: (word: string) => void;
    onHandleSendMessage: (message: string) => void;
}


const GameRoom: React.FC<GameRoomProps> = ({
    socket,
    room,
    gameState,
    roundPhase,
    isDrawer,
    isHost,
    currentDrawerId,
    drawerName,
    timeLeft,
    secretWord,
    roundInfo,
    isWordGuessed,
    revealTimer,
    revealedChars,
    wordOptions,
    roundResults,
    messages,
    systemMessage,
    hintNotification,
    onHandleLeaveRoom,
    onHandleStartGame,
    onHandleWordChoice,
    onHandleSendMessage,
}) => {
    return (
        <div className="min-h-screen bg-[#f5f3ea] relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute left-[8%] top-[10%] w-16 h-12 bg-white border-2 border-black rounded-full rotate-12 z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
            </div>
            <div className="absolute right-[12%] top-[15%] w-12 h-12 bg-pink-100 border-2 border-black rounded-full -rotate-6 z-10"></div>
            <div className="absolute left-[20%] bottom-[10%] w-10 h-10 bg-gray-200 border-2 border-black rounded-full rotate-45 z-10"></div>

            {/* Main Content */}
            <main className="relative z-20 p-4 min-h-screen">
                <div className="max-w-[1600px] mx-auto">
                    {/* Navigation */}
                    <div className="mb-4">
                        <GameNavigation roomId={room.roomId} onLeaveRoom={onHandleLeaveRoom} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
                        {/* Left Sidebar - Player List */}
                        <div className="lg:col-span-2 order-2 lg:order-1">
                            <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full max-h-[400px] lg:max-h-none">
                                <div className="text-sm font-black mb-3 uppercase">Players</div>
                                <PlayerList
                                    users={room.users}
                                    drawerId={currentDrawerId}
                                    hostId={room.hostId}
                                    myId={socket.id || ""}
                                />
                            </div>
                        </div>

                        {/* Center - Game Area */}
                        <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-3">
                            {gameState === "playing" ? (
                                <>
                                    {roundPhase === "choose-word" && (
                                        <div className="bg-purple-600 border-2 border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <div className="text-white text-sm font-black text-center uppercase">
                                                {isDrawer
                                                    ? "Choose a word to draw!"
                                                    : `${drawerName} is choosing a word... (${timeLeft}s)`}
                                            </div>
                                        </div>
                                    )}
                                    {roundPhase === "drawing" && (
                                        <>
                                            <div className="bg-white border-2 border-black rounded-xl p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <GameInfoBar
                                                    isDrawer={isDrawer}
                                                    secretWord={secretWord}
                                                    timeLeft={isWordGuessed ? revealTimer : timeLeft}
                                                    round={roundInfo.round}
                                                    totalRounds={roundInfo.totalRounds}
                                                    isWordGuessed={isWordGuessed}
                                                    revealedChars={revealedChars}
                                                />
                                            </div>
                                            
                                            {/* Hint Notification */}
                                            {hintNotification && !isDrawer && (
                                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                                                    <div className="text-white text-sm font-black text-center uppercase">
                                                        {hintNotification}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {roundPhase === "results" && (
                                        <div className="bg-green-600 border-2 border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <div className="text-white text-sm font-black text-center uppercase">
                                                Round Results! Next round in {timeLeft}s
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-gray-600 border-2 border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="text-white text-sm font-black text-center uppercase">
                                        Waiting for host to start the game...
                                    </div>
                                </div>
                            )}

                            {/* Canvas Container - Improved responsiveness */}
                            <div className="flex-1 relative min-h-[400px] lg:min-h-[500px]">
                                {/* Word Choice Overlay */}
                                {roundPhase === "choose-word" && isDrawer && wordOptions.length > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-2xl z-50">
                                        <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <h3 className="text-xl font-black text-black mb-4 uppercase">
                                                Choose a word to draw:
                                            </h3>
                                            <div className="flex gap-4">
                                                {wordOptions.map((word, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => onHandleWordChoice(word)}
                                                        className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-black rounded-full transition uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                    >
                                                        {word}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Round Results Overlay - Simple Scorecard */}
                                {roundPhase === "results" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-2xl z-50">
                                        <div className="bg-white border-2 border-black p-6 rounded-2xl max-w-md w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <h3 className="text-xl font-black text-black mb-4 uppercase text-center">
                                                🎉 Round {roundInfo.round} Results 🎉
                                            </h3>
                                            <p className="text-black mb-4 font-black text-center">
                                                Word was: <span className="text-red-600">"{secretWord}"</span>
                                            </p>
                                            <div className="space-y-2">
                                                {roundResults.length > 0 ? (
                                                    roundResults.map((result, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex justify-between items-center bg-gray-100 border-2 border-black p-3 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                        >
                                                            <span className="text-black font-black uppercase">{result.username}</span>
                                                            <span className="text-green-600 font-black">+{result.points} pts</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center p-4 bg-gray-100 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                        <p className="text-black font-black uppercase">No correct guesses!</p>
                                                        <p className="text-gray-600 font-bold">Better luck next round!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Start Game Overlay for Lobby */}
                                {gameState === "lobby" && isHost && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-2xl z-50">
                                        <button
                                            onClick={onHandleStartGame}
                                            className="px-10 py-5 text-2xl bg-black border-2 border-black rounded-full hover:bg-gray-800 text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition uppercase"
                                        >
                                            Start Game
                                        </button>
                                    </div>
                                )}

                                <Canvas
                                    socket={socket}
                                    roomId={room.roomId}
                                    isDrawer={isDrawer && roundPhase === "drawing"}
                                />
                            </div>
                        </div>

                        {/* Right Sidebar - Chat */}
                        <div className="lg:col-span-3 order-3 lg:order-3">
                            <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full max-h-[400px] lg:max-h-none overflow-hidden">
                                <div className="text-sm font-black p-3 border-b-2 border-black uppercase bg-white">Chat</div>
                                <ChatBox
                                    messages={messages}
                                    systemMessage={systemMessage}
                                    onSendMessage={onHandleSendMessage}
                                    isDrawer={isDrawer && roundPhase === "drawing"}
                                    isWordGuessed={isWordGuessed}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GameRoom;