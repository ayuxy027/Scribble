import React, { useState, useRef, useEffect } from "react";
// Use type-only import to avoid runtime import issues
import type { Message } from "../GamePage";

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
    <div className="bg-white border-2 border-black rounded-2xl p-4 h-full flex flex-col shadow-lg">
      <div className="flex-1 overflow-y-auto mb-2 pr-1">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <span className="font-bold text-black uppercase">{msg.username}: </span>
            <span className="text-gray-800">{msg.message}</span>
          </div>
        ))}
        {systemMessage && (
          <div className="text-red-600 font-bold my-2 uppercase">{systemMessage}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-full border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
          placeholder={isDrawer ? "You are drawing..." : isWordGuessed ? "Word revealed!" : "Type your guess..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isDrawer || isWordGuessed}
          maxLength={40}
          autoComplete="off"
        />
        <button
          className="bg-black hover:bg-gray-800 px-4 py-2 rounded-full text-white font-bold uppercase transition"
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