import React, { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

interface WalletContextType {
  isAuthenticated: boolean
  userAddress: string | null
  connectWallet: () => void
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  const connectWallet = async () => {
    console.log("Attempting to connect with Leather wallet...")

    try {
      // Method 1: Try using Leather's direct API if available
      if ((window as any).LeatherProvider) {
        console.log("Using Leather Provider directly...")
        const provider = (window as any).LeatherProvider

        const result = await provider.request({
          method: "stx_requestAccounts",
        })

        if (result && result.addresses && result.addresses.length > 0) {
          const address = result.addresses[0]
          setIsAuthenticated(true)
          setUserAddress(address)
          console.log("Connected successfully with address:", address)
          return
        }
      }

      // Method 2: Try using window.btc if available (Leather also exposes this)
      if ((window as any).btc) {
        console.log("Using window.btc provider...")
        const btc = (window as any).btc

        const result = await btc.request("getAddresses")
        if (result && result.addresses && result.addresses.length > 0) {
          const stxAddress = result.addresses.find(
            (addr: any) => addr.type === "stacks"
          )
          if (stxAddress) {
            setIsAuthenticated(true)
            setUserAddress(stxAddress.address)
            console.log(
              "Connected successfully with STX address:",
              stxAddress.address
            )
            return
          }
        }
      }

      // Method 3: Fallback - show instruction to user
      alert(`
        Please connect your Leather wallet manually:
        1. Click on the Leather extension icon
        2. Unlock your wallet if needed
        3. Then try connecting again
        
        If this persists, make sure Leather wallet is installed and enabled.
      `)
    } catch (error) {
      console.error("Error connecting to Leather wallet:", error)
      alert(`
        Failed to connect to Leather wallet.
        Error: ${error instanceof Error ? error.message : String(error)}
        
        Please make sure:
        1. Leather wallet is installed
        2. Leather wallet is unlocked
        3. This site is allowed to connect to your wallet
      `)
    }
  }

  const disconnectWallet = () => {
    setIsAuthenticated(false)
    setUserAddress(null)
    console.log("Wallet disconnected")
  }

  const value: WalletContextType = {
    isAuthenticated,
    userAddress,
    connectWallet,
    disconnectWallet,
  }

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
