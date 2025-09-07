import React from "react"
import { useWallet } from "../contexts/WalletContext"

interface WalletStatusProps {
  showFullAddress?: boolean
  className?: string
}

const WalletStatus: React.FC<WalletStatusProps> = ({
  showFullAddress = false,
  className = "",
}) => {
  const { isAuthenticated, userAddress, connectWallet, disconnectWallet } =
    useWallet()

  const formatAddress = (address: string) => {
    if (showFullAddress) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={connectWallet}
        className={`border-2 border-black px-6 py-3 rounded-full font-black hover:bg-black hover:text-white transition-colors ${className}`}
      >
        CONNECT WALLET
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="border-2 border-green-500 bg-green-50 text-green-700 rounded-full px-4 py-2">
        <div className="text-sm font-bold">
          🟢 {userAddress && formatAddress(userAddress)}
        </div>
      </div>
      <button
        onClick={disconnectWallet}
        className="border-2 border-red-500 text-red-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-red-500 hover:text-white transition-colors"
      >
        DISCONNECT
      </button>
    </div>
  )
}

export default WalletStatus
