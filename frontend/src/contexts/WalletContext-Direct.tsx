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

    if (typeof (window as any).LeatherProvider === "undefined") {
      alert("Leather wallet is not installed. Please install it and try again.")
      console.error("Leather provider not found.")
      return
    }

    try {
      console.log("Requesting addresses from Leather wallet...")
      const resp = await (window as any).LeatherProvider.request("getAddresses")

      console.log("Wallet response received:", resp)

      // The response contains a `result` object, which in turn contains the `addresses` array.
      if (resp && resp.result && Array.isArray(resp.result.addresses)) {
        const addresses = resp.result.addresses
        console.log("Addresses found:", addresses)

        // Find the Stacks address in the array
        const stacksAddress = addresses.find(
          (addr: any) => addr.type === "stacks"
        )

        if (stacksAddress && stacksAddress.address) {
          console.log("Found STX address:", stacksAddress.address)
          setUserAddress(stacksAddress.address)
          setIsAuthenticated(true)
        } else {
          console.error(
            "No STX address found in the wallet response.",
            addresses
          )
          alert(
            "No Stacks address found in your wallet. Please make sure you have a Stacks account in your Leather wallet."
          )
        }
      } else {
        console.error(
          "Invalid response structure from wallet. Expected `result.addresses` array.",
          resp
        )
        alert(
          "Received an unexpected response from the wallet. Please check the console for details."
        )
      }
    } catch (error) {
      console.error("Failed to connect to Leather wallet.", error)
      alert(
        `Failed to connect to Leather wallet. Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
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
