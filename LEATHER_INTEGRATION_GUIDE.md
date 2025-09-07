# Step-by-Step Guide: Integrating Leather Wallet in Your React App

This guide provides a clear, step-by-step method to integrate the Leather (formerly Hiro) wallet directly into your React + TypeScript application. This approach interacts with the wallet provider injected into the browser, which is a robust and reliable method.

---

### **Step 1: Create a Wallet Context**

First, we need a central place to manage the wallet's state (like connection status and user address). A React Context is perfect for this.

1.  Create a new folder `src/contexts`.
2.  Inside it, create a file named `WalletContext.tsx`.
3.  Add the following code to `src/contexts/WalletContext.tsx`:

```typescript
import React, { createContext, useContext, useState, ReactNode } from "react"

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
      console.log("Leather provider found. Requesting accounts...")
      const provider = window.LeatherProvider

      // Request the user's accounts from the wallet.
      const result = await provider.request("stx_requestAccounts")

      // The result contains the user's addresses. We'll use the first one.
      const stxAddress = result.result.addresses.find(
        (addr: any) => addr.symbol === "STX"
      )

      if (stxAddress) {
        const address = stxAddress.address
        setIsAuthenticated(true)
        setUserAddress(address)
        console.log("Connected successfully with STX address:", address)
      } else {
        throw new Error("No STX address found in wallet response.")
      }
    } catch (error) {
      console.error("Error connecting to Leather wallet:", error)
      alert(
        `Failed to connect to Leather wallet. Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
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
```

---

### **Step 2: Provide the Context to Your Application**

Now, you need to wrap your entire application with the `WalletProvider` so that all components can access the wallet state.

1.  Open your `src/main.tsx` file.
2.  Import `WalletProvider` and wrap your `<App />` component with it.

```typescript
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"
import { WalletProvider } from "./contexts/WalletContext" // <-- Import the provider

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* Wrap your App with the WalletProvider */}
      <WalletProvider>
        <App />
      </WalletProvider>
    </BrowserRouter>
  </StrictMode>
)
```

---

### **Step 3: Use the Wallet Context in Your Component**

Finally, you can use the `useWallet` hook in any component to access the wallet state and functions. Let's update your `Hero.tsx` component.

1.  Open `src/components/Hero.tsx`.
2.  Import the `useWallet` hook.
3.  Use the hook to get the wallet state and functions.
4.  Update your button's `onClick` handler and conditionally render the UI.

```typescript
import BannerPng from "../assets/banner.png"
import CTAPng from "../assets/cta.png"
import Panda from "./Panda"
import { Link } from "react-router-dom"
import { useWallet } from "../contexts/WalletContext" // <-- Import the hook

const Hero = () => {
  // Get wallet state and functions from the context.
  const { isAuthenticated, userAddress, connectWallet, disconnectWallet } =
    useWallet()

  // Helper function to format the address for display.
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="bg-white relative overflow-hidden">
      {/* ... (rest of your Hero component's JSX) ... */}

      {/* CTA Section */}
      <div className="min-h-screen bg-white py-20 px-8">
        <div className="max-w-6xl mx-auto">
          {/* ... (text content) ... */}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              to="/lobby"
              className="bg-black text-white px-10 py-5 rounded-full text-xl font-black hover:bg-gray-800 transition-colors relative inline-block text-center"
            >
              <span>LOBBY</span>
              <span className="absolute -top-2 -right-2 w-6 h-6">
                <Panda size="sm" />
              </span>
            </Link>

            {/* Conditional UI based on wallet connection status */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="border-2 border-green-500 bg-green-50 px-6 py-3 rounded-full text-sm font-black text-center">
                  <span className="text-green-700">
                    CONNECTED: {userAddress && formatAddress(userAddress)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="border-2 border-red-500 px-6 py-3 rounded-full text-sm font-black hover:bg-red-500 hover:text-white transition-colors text-center"
                >
                  <span>DISCONNECT</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet} // <-- Call the connect function
                className="border-2 border-black px-10 py-5 rounded-full text-xl font-black hover:bg-black hover:text-white transition-colors relative inline-block text-center"
              >
                <span>CONNECT WALLET</span>
                <span
                  className="absolute -top-2 -right-2 w-6 h-6"
                  style={{ transform: "rotate(45deg)" }}
                >
                  <Panda size="sm" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
```

---

### **Summary**

You have now successfully implemented a robust Leather wallet integration.

1.  **`WalletContext.tsx`** manages all wallet logic.
2.  **`main.tsx`** provides this context to your entire app.
3.  **`Hero.tsx`** uses the `useWallet` hook to interact with the wallet and display the correct UI.

This setup is clean, reusable, and directly interacts with the Leather wallet for a better user experience. You can now use the `useWallet()` hook in any other component where you need wallet information.
