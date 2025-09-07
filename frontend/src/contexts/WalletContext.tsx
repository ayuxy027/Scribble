import React, { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

// This extends the global `window` object to include types for Leather wallet.
// This is necessary for TypeScript to recognize `window.LeatherProvider`.
declare global {
  interface Window {
    LeatherProvider?: {
      request: (method: string, params?: any) => Promise<any>
    }
  }
}

// Define the shape of our context's state and functions.
interface WalletContextType {
  isAuthenticated: boolean
  userAddress: string | null
  connectWallet: () => void
  disconnectWallet: () => void
}

// Create the context with an initial undefined value.
const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Create the WalletProvider component.
export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  // The function to connect to the Leather wallet.
  const connectWallet = async () => {
    console.log("Attempting to connect with Leather wallet...")

    // Ensure we are running in a browser environment.
    if (typeof window === "undefined" || !window.LeatherProvider) {
      alert(
        "Leather wallet is not installed. Please install the extension to connect."
      )
      console.error("Leather provider not found on window object.")
      return
    }

    try {
      console.log(
        'Leather provider found. Requesting addresses with "getAddresses" method...'
      )
      const provider = window.LeatherProvider

      // Using 'getAddresses' which is the correct, modern method for Leather wallet.
      const resp = await provider.request("getAddresses")

      // The response from Leather's getAddresses is a JSON-RPC object.
      // The actual payload is in `resp.result`.
      const addresses = resp.result.addresses

      // Find the STX address from the list of addresses.
      const stxAddressInfo = addresses.find(
        (addr: any) => addr.type === "stacks"
      )

      if (stxAddressInfo) {
        const address = stxAddressInfo.address
        setIsAuthenticated(true)
        setUserAddress(address)
        console.log("Connected successfully with STX address:", address)
      } else {
        throw new Error(
          "No STX address found in the wallet. Please ensure you have a Stacks account in your Leather wallet."
        )
      }
    } catch (error) {
      console.error("Error connecting to Leather wallet:", error)
      // Improved error logging to handle non-standard error objects
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error, null, 2)
      alert(`Failed to connect to Leather wallet. Error: ${errorMessage}`)
    }
  }

  // The function to disconnect the wallet.
  const disconnectWallet = () => {
    setIsAuthenticated(false)
    setUserAddress(null)
    console.log("Wallet disconnected")
  }

  // The value that will be provided to all children components.
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

// Create a custom hook for easy access to the context.
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
