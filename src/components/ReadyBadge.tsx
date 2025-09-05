import React from "react"

type ReadyBadgeProps = {
  ready: boolean
}

const ReadyBadge: React.FC<ReadyBadgeProps> = ({ ready }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold uppercase px-2.5 py-1 rounded-full border-2 ${
        ready ? "bg-green-200 border-black" : "bg-gray-200 border-black"
      } shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          ready ? "bg-green-500" : "bg-gray-500"
        }`}
      ></span>
      {ready ? "Ready" : "Not Ready"}
    </span>
  )
}

export default ReadyBadge
