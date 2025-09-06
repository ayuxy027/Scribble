import React, { useState } from "react";

type RoomSectionProps = {
  onRoomJoined?: (roomName: string) => void;
};

type RoomMode = "selection" | "create" | "join" | "active";

const RoomSection: React.FC<RoomSectionProps> = ({ onRoomJoined }) => {
  // State to track which mode we're in
  const [mode, setMode] = useState<RoomMode>("selection");
  
  // State for room name (either created or joined)
  const [roomName, setRoomName] = useState<string>("");
  
  // State for the input field when joining a room
  const [joinRoomInput, setJoinRoomInput] = useState<string>("");

  // Function to handle room creation
  const handleCreateRoom = () => {
    // Generate a random room code
    const generatedRoomName = `Room-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomName(generatedRoomName);
    setMode("active");
    if (onRoomJoined) onRoomJoined(generatedRoomName);
  };

  // Function to handle room joining
  const handleJoinRoom = () => {
    if (joinRoomInput.trim()) {
      setRoomName(joinRoomInput);
      setMode("active");
      if (onRoomJoined) onRoomJoined(joinRoomInput);
    }
  };

  // Render based on the current mode
  const renderContent = () => {
    switch (mode) {
      case "selection":
        return (
          <div className="flex flex-col gap-4">
            <button
              className="border-2 border-black rounded-xl px-5 py-3 font-bold text-lg bg-white hover:bg-gray-100 active:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => setMode("create")}
            >
              Create Room
            </button>
            <button
              className="border-2 border-black rounded-xl px-5 py-3 font-bold text-lg bg-white hover:bg-gray-100 active:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => setMode("join")}
            >
              Join Room
            </button>
          </div>
        );

      case "create":
        return (
          <div className="flex flex-col gap-3">
            <p className="text-md">Create a new room and share the code with friends.</p>
            <button
              className="border-2 border-black rounded-xl px-5 py-3 font-bold text-lg bg-green-200 hover:bg-green-300 active:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              onClick={handleCreateRoom}
            >
              Create New Room
            </button>
            <button
              className="text-sm underline mt-2"
              onClick={() => setMode("selection")}
            >
              ← Back
            </button>
          </div>
        );

      case "join":
        return (
          <div className="flex flex-col gap-3">
            <p className="text-md">Enter a room code to join.</p>
            <input
              type="text"
              className="border-2 border-black rounded-lg px-4 py-2 font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              placeholder="Enter room code"
              value={joinRoomInput}
              onChange={(e) => setJoinRoomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            />
            <button
              className="border-2 border-black rounded-xl px-5 py-2 font-bold text-lg bg-blue-200 hover:bg-blue-300 active:translate-y-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              onClick={handleJoinRoom}
              disabled={!joinRoomInput.trim()}
            >
              Join Room
            </button>
            <button
              className="text-sm underline mt-2"
              onClick={() => setMode("selection")}
            >
              ← Back
            </button>
          </div>
        );

      case "active":
        return (
          <>
            <div
              className="font-bold text-xl mb-3 flex items-center justify-between"
              title={roomName}
            >
              <span>{roomName}</span>
              <button
                className="border-2 border-black rounded-full w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 active:translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => navigator.clipboard?.writeText(roomName)}
                title="Copy Room Code"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                </svg>
              </button>
            </div>
            <div className="mt-1">
              <button
                className="text-sm underline"
                onClick={() => {
                  setMode("selection");
                  setRoomName("");
                  setJoinRoomInput("");
                }}
              >
                Leave Room
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="border-2 border-black rounded-2xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
      <div className="text-lg font-black mb-4 relative">
        Room
        <div className="absolute bottom-0 left-0 right-0 h-[6px] overflow-hidden">
          <svg
            width="100%"
            height="8"
            viewBox="0 0 100 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0V8H0V3Z"
              fill="#E5E7EB"
            />
            <path
              d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default RoomSection;
