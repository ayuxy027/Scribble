import React from "react"
import Avatar from "./Avatar"
import ReadyBadge from "./ReadyBadge"

export type Player = {
  id: string
  name: string
  avatarUrl?: string
  ready: boolean
  isHost?: boolean
}

type PlayerListProps = {
  players: Player[]
}

const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  return (
    <>
      <style>
        {`
          @keyframes retroBreathe {
            0% {
              transform: scale(1);
              filter: brightness(1);
            }
            50% {
              transform: scale(1.05);
              filter: brightness(1.15) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
            }
            100% {
              transform: scale(1);
              filter: brightness(1);
            }
          }

          @keyframes retroBobble {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-2px);
            }
            100% {
              transform: translateY(0);
            }
          }

          @keyframes retroPixelate {
            0% {
              image-rendering: auto;
            }
            50% {
              image-rendering: pixelated;
            }
            100% {
              image-rendering: auto;
            }
          }

          .player-item:hover .retro-breathe {
            animation: retroBreathe 1.8s infinite ease-in-out;
          }

          .player-item:hover .retro-bobble {
            animation: retroBobble 1.5s infinite ease-in-out;
          }
          
          .player-item:hover .retro-bobble-delayed {
            animation: retroBobble 1.8s infinite ease-in-out;
            animation-delay: 0.2s;
          }
          
          .player-item:hover .retro-avatar {
            animation: retroPixelate 2s infinite ease-in-out, retroBobble 1.5s infinite ease-in-out;
          }
        `}
      </style>
      <ul className="space-y-3 pb-1">
        {players.map((p) => (
          <li
            key={p.id}
            className="player-item flex items-center justify-between gap-3 border-2 border-black rounded-xl px-4 py-3 bg-white hover:bg-gray-50 transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px]"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="retro-bobble">
                <Avatar
                  name={p.name}
                  src={p.avatarUrl}
                  size={48}
                  className="retro-avatar"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="retro-breathe font-bold truncate max-w-[12rem] text-lg"
                    title={p.name}
                  >
                    {p.name}
                  </span>
                  {p.isHost && (
                    <span className="retro-bobble-delayed text-[10px] font-black px-2 py-0.5 border-2 border-black rounded-full bg-yellow-200 uppercase tracking-wider">
                      Host
                    </span>
                  )}
                </div>
                <div className="mt-1 retro-bobble-delayed">
                  <ReadyBadge ready={p.ready} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export default PlayerList
