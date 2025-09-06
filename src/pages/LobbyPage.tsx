import React, { useMemo, useState } from "react"
import Navigation from "../components/Navigation"
import PlayerList, { type Player } from "../components/PlayerList"
import Avatar from "../components/Avatar"
import RoomSection from "../components/RoomSection"

const LobbyPage: React.FC = () => {
  // Demo local state; replace with actual state/store later
  const [meReady, setMeReady] = useState(false)
  const [roomName, setRoomName] = useState<string>("")
  
  const hostName = "Alex Johnson"

  const players: Player[] = useMemo(
    () => [
      { id: "1", name: hostName, ready: true, isHost: true },
      { id: "2", name: "Priya Singh", ready: true },
      { id: "3", name: "Marco Rossi", ready: false },
      { id: "4", name: "You", ready: meReady },
      { id: "5", name: "Emily Chen", ready: true },
      { id: "6", name: "Raj Patel", ready: false },
      { id: "7", name: "Sarah Johnson", ready: true },
      { id: "8", name: "David Kim", ready: false },
      { id: "9", name: "Anna Martinez", ready: true },
      { id: "10", name: "Jason Lee", ready: false },
      { id: "11", name: "Michelle Wang", ready: true },
      { id: "12", name: "Carlos Rodriguez", ready: false },
    ],
    [meReady]
  )

  return (
    <div className="h-screen bg-[#f5f3ea] relative overflow-hidden">
      <Navigation />

      {/* Decorative Elements */}
      <div className="absolute left-[10%] top-[15%] w-24 h-16 bg-white border-2 border-black rounded-full rotate-12 z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full absolute top-0 left-3"></div>
          <div className="w-1 h-1 bg-black rounded-full absolute top-0 right-3"></div>
          <div className="w-3 h-1 bg-black rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>

      <div className="absolute right-[15%] top-[25%] w-16 h-12 bg-gray-200 border-2 border-black rounded-full -rotate-6 z-10"></div>

      <div className="absolute left-[25%] bottom-[15%] w-12 h-12 bg-pink-100 border-2 border-black rounded-full rotate-12 z-10"></div>

      <div className="absolute right-[20%] bottom-[20%] w-20 h-14 bg-blue-100 border-2 border-black rounded-full -rotate-12 z-10"></div>

      {/* Content */}
      <div className="flex flex-col items-center h-screen px-6 md:px-10 relative z-20 pt-16 pb-6">
        {/* Heading */}
        <div className="w-full max-w-5xl mb-4">
          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Lobby
          </h1>
        </div>

        {/* Main Grid Container - Flex with Fixed Height */}
        <div className="w-full max-w-5xl flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* Left Column: Host + Players */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
            {roomName ? (
              <>
                {/* Host */}
                <div className="border-2 border-black rounded-2xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                  <div className="text-lg font-black mb-4 relative">
                    Host
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
                  <div className="flex items-center gap-4">
                    <Avatar name={hostName} size={64} />
                    <div>
                      <div className="font-bold text-xl">{hostName}</div>
                      <div className="text-xs uppercase font-black bg-gray-200 border-2 border-black rounded-full inline-block px-3 py-0.5 mt-1">
                        Owner
                      </div>
                    </div>
                  </div>
                </div>

                {/* Players */}
                <div className="border-2 border-black rounded-2xl p-0 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col overflow-hidden">
                  <div className="text-lg font-black px-5 py-4 flex-shrink-0 bg-white sticky top-0 z-10">
                    Players
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
                  <div className="flex-1 overflow-y-auto px-5 pt-3 pb-3">
                    <PlayerList players={players} />
                  </div>
                </div>
              </>
            ) : (
              <div className="border-2 border-black rounded-2xl p-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black mb-4">Welcome to Scribble!</h2>
                  <p className="text-lg">Create a new room or join an existing one to get started.</p>
                </div>
                <div className="w-1/2 mb-4">
                  <img src="/src/assets/banner.png" alt="Scribble" className="w-full h-auto" />
                </div>
                <p className="text-lg font-medium">Select "Create Room" or "Join Room" from the sidebar →</p>
              </div>
            )}
          </div>

          {/* Right Column: Room + Status */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            {/* Room Section */}
            <RoomSection onRoomJoined={setRoomName} />

            {/* Status */}
            {roomName && (
              <div className="border-2 border-black rounded-2xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col flex-1">
                <div className="flex-1">
                  <div className="text-lg font-black mb-3 relative">
                    Chat
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

                  {/* Chat Interface - Coming Soon */}
                  <div className="h-[160px] border-2 border-black rounded-lg bg-gray-50 mb-3 overflow-hidden relative">
                    {/* Coming Soon Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="bg-white border-2 border-black px-6 py-3 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-5deg]">
                        <div className="text-2xl font-black tracking-wide">
                          COMING SOON
                        </div>
                      </div>
                    </div>

                    {/* Sample Chat Messages (Visible behind the overlay) */}
                    <div className="p-3 h-full flex flex-col">
                      <div className="flex mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-200 border border-black flex-shrink-0 mr-2"></div>
                        <div className="bg-white rounded-lg border border-black px-3 py-1.5 text-sm max-w-[75%]">
                          Hello everyone! Ready to play?
                        </div>
                      </div>
                      <div className="flex mb-2 justify-end">
                        <div className="bg-green-100 rounded-lg border border-black px-3 py-1.5 text-sm max-w-[75%]">
                          I'm ready to go!
                        </div>
                        <div className="w-8 h-8 rounded-full bg-green-200 border border-black flex-shrink-0 ml-2"></div>
                      </div>
                      <div className="flex mb-2">
                        <div className="w-8 h-8 rounded-full bg-pink-200 border border-black flex-shrink-0 mr-2"></div>
                        <div className="bg-white rounded-lg border border-black px-3 py-1.5 text-sm max-w-[75%]">
                          Let's start soon!
                        </div>
                      </div>
                      <div className="flex mb-2 justify-end">
                        <div className="bg-green-100 rounded-lg border border-black px-3 py-1.5 text-sm max-w-[75%]">
                          Just waiting for one more player.
                        </div>
                        <div className="w-8 h-8 rounded-full bg-yellow-200 border border-black flex-shrink-0 ml-2"></div>
                      </div>
                    </div>
                  </div>

                  {/* Message Input Field (Disabled) */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      className="w-full border-2 border-black rounded-full px-4 py-2 pr-10 text-sm bg-gray-100 cursor-not-allowed"
                      placeholder="Type a message..."
                      disabled
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-300 border border-black rounded-full w-7 h-7 flex items-center justify-center cursor-not-allowed">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 1.59 2.644C8 14 8 13 8 12.5a4.5 4.5 0 0 1 5.026-4.47L15.964.686Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-sm mb-2">
                    Toggle when you're ready to play.
                  </div>
                </div>
                <button
                  className={`mt-1 border-2 border-black rounded-full px-5 py-2 font-bold text-lg uppercase tracking-wide transition-colors ${
                    meReady ? "bg-green-300" : "bg-gray-300"
                  } hover:brightness-95 active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full`}
                  onClick={() => setMeReady((v) => !v)}
                >
                  {meReady ? "Ready" : "Not Ready"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LobbyPage
