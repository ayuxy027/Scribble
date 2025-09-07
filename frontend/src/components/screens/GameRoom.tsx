import React from 'react';
import { Socket } from 'socket.io-client';
import type { ClientToServerEvents, Message, RoomState, RoundInfo, ServerToClientEvents } from '../../types';

// Import your existing components
import PlayerList from '../game/PlayerList';
import GameInfoBar from '../game/GameInfoBar';
import Canvas from '../game/Canvas';
import ChatBox from '../game/ChatBox';

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
    wordOptions: string[];
    roundResults: any[];
    messages: Message[];
    systemMessage: string;
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
    wordOptions,
    roundResults,
    messages,
    systemMessage,
    onHandleLeaveRoom,
    onHandleStartGame,
    onHandleWordChoice,
    onHandleSendMessage,
}) => {
    return (
        <div className="flex flex-col h-screen p-4 gap-4 max-w-7xl mx-auto bg-white">
            <header className="flex justify-between items-center mb-2">
                <div className="bg-black text-white px-4 py-2 rounded-full relative">
                    <h1 className="text-2xl font-bold">STAKEBOARD</h1>
                    <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                </div>
                <div>
                    <span className="mr-4 text-black font-bold">
                        Room: <strong className="text-red-600">{room.roomId}</strong>
                    </span>
                    <button
                        onClick={onHandleLeaveRoom}
                        className="px-4 py-2 bg-red-600 border-2 border-red-600 rounded-full hover:bg-red-700 text-sm text-white font-bold uppercase transition"
                    >
                        Leave Room
                    </button>
                </div>
            </header>
            <main className="grid grid-cols-5 gap-4 flex-1 min-h-0">
                <div className="col-span-1">
                    <PlayerList
                        users={room.users}
                        drawerId={currentDrawerId}
                        hostId={room.hostId}
                        myId={socket.id || ""}
                    />
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                    {gameState === "playing" ? (
                        <>
                            {roundPhase === "choose-word" && (
                                <div className="h-14 flex items-center justify-center bg-purple-900 rounded-2xl border border-purple-700 shadow text-purple-100 text-lg">
                                    {isDrawer
                                        ? "Choose a word to draw!"
                                        : `${drawerName} is choosing a word... (${timeLeft}s)`}
                                </div>
                            )}
                            {roundPhase === "drawing" && (
                                <GameInfoBar
                                    isDrawer={isDrawer}
                                    secretWord={secretWord}
                                    timeLeft={isWordGuessed ? revealTimer : timeLeft}
                                    round={roundInfo.round}
                                    totalRounds={roundInfo.totalRounds}
                                    isWordGuessed={isWordGuessed}
                                />
                            )}
                            {roundPhase === "results" && (
                                <div className="h-14 flex items-center justify-center bg-green-900 rounded-2xl border border-green-700 shadow text-green-100 text-lg">
                                    Round Results! Next round in {timeLeft}s
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-14 flex items-center justify-center bg-gray-900 rounded-2xl border border-gray-800 shadow text-gray-300 text-lg">
                            Waiting for host to start the game...
                        </div>
                    )}

                    <div className="flex-1 relative bg-white border-2 border-black rounded-2xl shadow-lg">
                        {/* Word Choice Overlay */}
                        {roundPhase === "choose-word" && isDrawer && wordOptions.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-2xl z-10">
                                <div className="bg-white border-2 border-black p-6 rounded-2xl">
                                    <h3 className="text-xl font-bold text-black mb-4 uppercase">
                                        Choose a word to draw:
                                    </h3>
                                    <div className="flex gap-4">
                                        {wordOptions.map((word, index) => (
                                            <button
                                                key={index}
                                                onClick={() => onHandleWordChoice(word)}
                                                className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-full transition uppercase"
                                            >
                                                {word}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Round Results Overlay */}
                        {roundPhase === "results" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-2xl z-10">
                                <div className="bg-white border-2 border-black p-6 rounded-2xl max-w-md w-full">
                                    <h3 className="text-xl font-bold text-black mb-4 uppercase">
                                        Round {roundInfo.round} Results
                                    </h3>
                                    <p className="text-black mb-4 font-bold">
                                        Word was: <strong className="text-red-600">{secretWord}</strong>
                                    </p>
                                    <div className="space-y-2">
                                        {roundResults.map((result, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center bg-gray-100 border-2 border-gray-300 p-2 rounded-full"
                                            >
                                                <span className="text-black font-bold uppercase">{result.username}</span>
                                                <span className="text-green-600 font-bold">+{result.points} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Canvas
                            socket={socket}
                            roomId={room.roomId}
                            isDrawer={isDrawer && roundPhase === "drawing"}
                        />

                        {gameState === "lobby" && isHost && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-2xl">
                                <button
                                    onClick={onHandleStartGame}
                                    className="px-10 py-5 text-2xl bg-black border-2 border-black rounded-full hover:bg-gray-800 text-white font-bold shadow-lg transition uppercase"
                                >
                                    Start Game
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-span-1">
                    <ChatBox
                        messages={messages}
                        systemMessage={systemMessage}
                        onSendMessage={onHandleSendMessage}
                        isDrawer={isDrawer && roundPhase === "drawing"}
                        isWordGuessed={isWordGuessed}
                    />
                </div>
            </main>
        </div>
    );
};

export default GameRoom;