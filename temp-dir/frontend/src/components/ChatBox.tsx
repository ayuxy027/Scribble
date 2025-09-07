import React, { useState, useRef, useEffect } from "react";
// Use type-only import to avoid runtime import issues
import type { Message } from "../App";

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

  return (
    <div className="bg-gray-900 rounded-2xl p-4 h-full flex flex-col border border-gray-800 shadow-lg">
      <div className="flex-1 overflow-y-auto mb-2 pr-1">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <span className="font-bold text-blue-300">{msg.username}: </span>
            <span className="text-white">{msg.message}</span>
          </div>
        ))}
        {systemMessage && (
          <div className="text-yellow-400 font-semibold my-2">{systemMessage}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={isDrawer ? "You are drawing..." : isWordGuessed ? "Word revealed!" : "Type your guess..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isDrawer || isWordGuessed}
          maxLength={40}
          autoComplete="off"
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold transition"
          type="submit"
          disabled={isDrawer || isWordGuessed || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};
export default ChatBox;