import React, { useState, useRef, useEffect } from "react";
// Use type-only import to avoid runtime import issues
import type { Message } from "../../types";

interface ChatBoxProps {
  messages: Message[];
  systemMessage: string;
  onSendMessage: (msg: string) => void;
  isDrawer: boolean;
  isWordGuessed?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, systemMessage, onSendMessage, isDrawer, isWordGuessed }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, systemMessage]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  // Enhanced message rendering like Scribbl.io
  const renderMessage = (msg: Message, index: number) => {
    const isGuess = msg.type === 'guess';
    const isCorrectGuess = msg.type === 'correct-guess';
    const isCloseGuess = msg.type === 'close-guess';
    const isSystemMessage = msg.type === 'system';

    return (
      <div key={index} className={`mb-2 ${isSystemMessage ? 'text-center' : ''}`}>
        {isSystemMessage ? (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 text-blue-800 font-black text-xs uppercase">
            {msg.message}
          </div>
        ) : isCorrectGuess ? (
          <div className="bg-green-100 border border-green-400 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-green-700 uppercase text-sm bg-green-200 px-2 py-0.5 rounded-full">
                {msg.username}
              </span>
              <span className="text-green-800 font-bold">guessed the word!</span>
              <span className="text-green-600 text-xs">+{msg.points || 0} pts</span>
            </div>
          </div>
        ) : isCloseGuess ? (
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-yellow-700 uppercase text-sm bg-yellow-200 px-2 py-0.5 rounded-full">
                {msg.username}:
              </span>
              <span className="text-yellow-800 font-medium">{msg.message}</span>
              <span className="text-yellow-600 text-xs font-bold">Close!</span>
            </div>
          </div>
        ) : isGuess ? (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-700 uppercase text-sm bg-gray-200 px-2 py-0.5 rounded-full">
                {msg.username}:
              </span>
              <span className="text-gray-700 font-medium">{msg.message}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-lg p-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2">
              <span className="font-black text-black uppercase text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                {msg.username}:
              </span>
              <span className="text-gray-800 font-medium">{msg.message}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area - Fixed height with scroll */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50 border-b-2 border-black" style={{ minHeight: '200px', maxHeight: 'calc(100% - 80px)' }}>
        <div className="space-y-1">
          {messages.map((msg, idx) => renderMessage(msg, idx))}
          {systemMessage && (
            <div className="bg-red-100 border-2 border-red-600 rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
              <div className="text-red-600 font-black uppercase text-center text-sm">{systemMessage}</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed height */}
      <div className="flex-shrink-0 p-3 bg-white" style={{ height: '80px' }}>
        <form onSubmit={handleSend} className="flex gap-2 h-full items-center">
          <input
            className="flex-1 px-3 py-2 rounded-full border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium placeholder-gray-500 text-xs"
            placeholder={isDrawer ? "You are drawing..." : isWordGuessed ? "Word revealed!" : "Type your guess..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isDrawer || isWordGuessed}
            maxLength={40}
            autoComplete="off"
          />
          <button
            className="bg-black hover:bg-gray-800 px-4 py-2 rounded-full text-white font-black uppercase transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed text-xs min-w-[60px]"
            type="submit"
            disabled={isDrawer || isWordGuessed || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChatBox;