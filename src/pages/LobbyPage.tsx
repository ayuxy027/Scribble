import React, { useMemo, useState } from "react"
import Navigation from "../components/Navigation"
import PlayerList, { type Player } from "../components/PlayerList"
import Avatar from "../components/Avatar"

const LobbyPage: React.FC = () => {
  // Demo local state; replace with actual state/store later
  const [meReady, setMeReady] = useState(false)

  const roomName = "Room-1234"
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
    <div className="h-screen bg-[#fffdf6] relative overflow-hidden">
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

      <div className="absolute right-[15%] top-[25%] w-16 h-12 bg-yellow-200 border-2 border-black rounded-full -rotate-6 z-10"></div>

      <div className="absolute left-[25%] bottom-[15%] w-12 h-12 bg-pink-200 border-2 border-black rounded-full rotate-12 z-10"></div>

      <div className="absolute right-[20%] bottom-[20%] w-20 h-14 bg-blue-200 border-2 border-black rounded-full -rotate-12 z-10"></div>

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
            {/* Host */}
            <div className="border-2 border-black rounded-2xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
              <div className="text-lg font-black mb-4 relative">
                Host
                <div className="absolute bottom-0 left-0 right-0 h-[6px] overflow-hidden">
                  <svg width="100%" height="8" viewBox="0 0 100 8" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0V8H0V3Z" fill="#E5E7EB" />
                    <path d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar name={hostName} size={64} />
                <div>
                  <div className="font-bold text-xl">{hostName}</div>
                  <div className="text-xs uppercase font-black bg-yellow-200 border-2 border-black rounded-full inline-block px-3 py-0.5 mt-1">
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
                  <svg width="100%" height="8" viewBox="0 0 100 8" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0V8H0V3Z" fill="#E5E7EB" />
                    <path d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pt-3 pb-3">
                <PlayerList players={players} />
              </div>
            </div>
          </div>

          {/* Right Column: Room + Status */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            {/* Room name */}
            <div className="border-2 border-black rounded-2xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
              <div className="text-lg font-black mb-4 relative">
                Room
                <div className="absolute bottom-0 left-0 right-0 h-[6px] overflow-hidden">
                  <svg width="100%" height="8" viewBox="0 0 100 8" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0V8H0V3Z" fill="#E5E7EB" />
                    <path d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="font-bold text-xl mb-4" title={roomName}>
                {roomName}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="border-2 border-black rounded-full px-4 py-2 font-bold bg-white hover:bg-yellow-100 active:translate-y-[1px] w-full flex items-center justify-center gap-2"
                  onClick={() => navigator.clipboard?.writeText(roomName)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                  </svg>
                  Copy Room Code
                </button>
                <button className="border-2 border-black rounded-full px-4 py-2 font-bold bg-white hover:bg-yellow-100 active:translate-y-[1px] w-full flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                  Room Options
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="border-2 border-black rounded-2xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col flex-1">
              <div className="flex-1">
                <div className="text-lg font-black mb-4 relative">
                  Status
                  <div className="absolute bottom-0 left-0 right-0 h-[6px] overflow-hidden">
                    <svg width="100%" height="8" viewBox="0 0 100 8" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                      <path d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0V8H0V3Z" fill="#E5E7EB" />
                      <path d="M0 3C8.33333 1.66667 16.6667 1 25 1C33.3333 1 41.6667 2.33333 50 5C58.3333 7.66667 66.6667 8.33333 75 7C83.3333 5.66667 91.6667 3.33333 100 0" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm">Toggle when you're ready to play.</div>
              </div>
              <button
                className={`mt-4 border-2 border-black rounded-full px-6 py-3 font-bold text-xl uppercase tracking-wide transition-colors ${
                  meReady ? "bg-green-300" : "bg-yellow-200"
                } hover:brightness-95 active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                onClick={() => setMeReady((v) => !v)}
              >
                {meReady ? "Ready" : "Not Ready"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LobbyPage
