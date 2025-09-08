import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useWallet } from './WalletContext';

interface GameContractData {
  gameId: number | null;
  stakeAmount: number;
  totalPot: number;
  players: string[];
  state: string;
  host: string;
}

interface Web3GameContextType {
  // Contract interaction state
  contractGameData: GameContractData | null;
  isLoading: boolean;
  error: string | null;
  
  // Transaction states
  stakingTxId: string | null;
  isStaking: boolean;
  stakingComplete: boolean;
  
  // Game management functions
  createWeb3Game: (stakeAmount: number) => Promise<{ success: boolean; gameId?: number; error?: string }>;
  joinWeb3Game: (gameId: number) => Promise<{ success: boolean; error?: string }>;
  getGameDetails: (gameId: number) => Promise<GameContractData | null>;
  calculateRewards: (gameId: number) => Promise<{ winnerReward: number; platformFee: number } | null>;
  
  // Utility functions
  getMinStakeAmount: () => Promise<number>;
  validateStakeAmount: (amount: number) => boolean;
  formatStxAmount: (microStx: number) => string;
  stxToMicroStx: (stx: number) => number;
  
  // Reset functions
  resetWeb3State: () => void;
}

const Web3GameContext = createContext<Web3GameContextType | undefined>(undefined);

export const Web3GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, userAddress } = useWallet();
  
  // State management
  const [contractGameData, setContractGameData] = useState<GameContractData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stakingTxId, setStakingTxId] = useState<string | null>(null);
  const [isStaking, setIsStaking] = useState(false);
  const [stakingComplete, setStakingComplete] = useState(false);
  
  // Contract configuration
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const contractName = import.meta.env.VITE_CONTRACT_NAME || 'scribble-stake';
  const networkUrl = import.meta.env.VITE_NETWORK === 'mainnet' 
    ? 'https://api.mainnet.hiro.so'
    : 'https://api.testnet.hiro.so';

  /**
   * Creates a new Web3 game with staking using Leather wallet
   */
  const createWeb3Game = async (stakeAmount: number): Promise<{ success: boolean; gameId?: number; error?: string }> => {
    if (!isAuthenticated || !userAddress) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);
    setIsStaking(true);

    try {
      // Validate stake amount
      if (!validateStakeAmount(stakeAmount)) {
        throw new Error('Invalid stake amount. Must be between 1-100 STX');
      }

      const microStxAmount = stxToMicroStx(stakeAmount);

      // Use Leather wallet to make the contract call
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'create-game',
        functionArgs: [`u${microStxAmount}`], // Format as Clarity uint
        stxAddress: userAddress,
        postConditions: [],
      };

      // Call Leather wallet provider
      const result = await (window as any).LeatherProvider.request('stx_contractCall', txOptions);
      
      if (result && result.result && result.result.txid) {
        setStakingTxId(result.result.txid);
        
        // Wait for transaction confirmation
        const confirmed = await waitForTransactionConfirmation(result.result.txid);
        
        if (confirmed.success) {
          setStakingComplete(true);
          // Extract game ID from transaction result
          const gameId = await extractGameIdFromTransaction(result.result.txid);
          
          return { success: true, gameId: gameId || undefined };
        } else {
          throw new Error('Transaction failed or timed out');
        }
      } else {
        throw new Error('Failed to broadcast transaction');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create Web3 game';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setIsStaking(false);
    }
  };

  /**
   * Joins an existing Web3 game with staking
   */
  const joinWeb3Game = async (gameId: number): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated || !userAddress) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);
    setIsStaking(true);

    try {
      // Get game details first to check stake amount
      const gameDetails = await getGameDetails(gameId);
      if (!gameDetails) {
        throw new Error('Game not found');
      }

      // Use Leather wallet to make the contract call
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'join-game',
        functionArgs: [`u${gameId}`], // Format as Clarity uint
        stxAddress: userAddress,
        postConditions: [],
      };

      const result = await (window as any).LeatherProvider.request('stx_contractCall', txOptions);
      
      if (result && result.result && result.result.txid) {
        setStakingTxId(result.result.txid);
        
        const confirmed = await waitForTransactionConfirmation(result.result.txid);
        
        if (confirmed.success) {
          setStakingComplete(true);
          return { success: true };
        } else {
          throw new Error('Transaction failed or timed out');
        }
      } else {
        throw new Error('Failed to broadcast transaction');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join Web3 game';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setIsStaking(false);
    }
  };

  /**
   * Gets game details from the smart contract
   */
  const getGameDetails = async (gameId: number): Promise<GameContractData | null> => {
    try {
      const response = await fetch(
        `${networkUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-game-details`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: contractAddress,
            arguments: [`0x${gameId.toString(16).padStart(32, '0')}`] // Convert to hex
          }),
        }
      );

      const result = await response.json();
      
      if (result && result.okay && result.result) {
        // Parse the Clarity response
        const data = parseClarityValue(result.result);
        if (data && data.type === 'some') {
          const gameData = data.value;
          return {
            gameId,
            stakeAmount: parseInt(gameData['stake-amount']),
            totalPot: parseInt(gameData['pot-total']),
            players: gameData.players || [],
            state: gameData.state || 'unknown',
            host: gameData.host || ''
          };
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error getting game details:', err);
      return null;
    }
  };

  /**
   * Calculates expected rewards for a game
   */
  const calculateRewards = async (gameId: number): Promise<{ winnerReward: number; platformFee: number } | null> => {
    try {
      const response = await fetch(
        `${networkUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/calculate-rewards`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: contractAddress,
            arguments: [`0x${gameId.toString(16).padStart(32, '0')}`]
          }),
        }
      );

      const result = await response.json();
      
      if (result && result.okay && result.result) {
        const data = parseClarityValue(result.result);
        if (data && data.type === 'some') {
          return {
            winnerReward: parseInt(data.value['winner-reward']),
            platformFee: parseInt(data.value['platform-fee'])
          };
        }
      }
      
      return null;
    } catch (err) {
      console.error('Error calculating rewards:', err);
      return null;
    }
  };

  /**
   * Gets the minimum stake amount required
   */
  const getMinStakeAmount = async (): Promise<number> => {
    try {
      const response = await fetch(
        `${networkUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-min-stake-amount`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: contractAddress,
            arguments: []
          }),
        }
      );

      const result = await response.json();
      return result && result.okay ? parseInt(result.result) : 1000000; // Default 1 STX
    } catch (err) {
      console.error('Error getting min stake amount:', err);
      return 1000000; // Default 1 STX
    }
  };

  /**
   * Validates if the stake amount is acceptable
   */
  const validateStakeAmount = (amount: number): boolean => {
    const microStxAmount = stxToMicroStx(amount);
    return microStxAmount >= 1000000 && microStxAmount <= 100000000; // 1-100 STX range
  };

  /**
   * Formats microSTX amount to human-readable STX
   */
  const formatStxAmount = (microStx: number): string => {
    const stx = microStx / 1000000;
    return `${stx.toFixed(2)} STX`;
  };

  /**
   * Converts STX to microSTX
   */
  const stxToMicroStx = (stx: number): number => {
    return Math.floor(stx * 1000000);
  };

  /**
   * Waits for transaction confirmation
   */
  const waitForTransactionConfirmation = async (txId: string, timeoutMs = 60000): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false });
      }, timeoutMs);

      const checkTransaction = async () => {
        try {
          const response = await fetch(`${networkUrl}/extended/v1/tx/${txId}`);
          const txData = await response.json();
          
          if (txData.tx_status === 'success') {
            clearTimeout(timeout);
            resolve({ success: true });
          } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'abort_by_post_condition') {
            clearTimeout(timeout);
            resolve({ success: false });
          } else {
            // Still pending, check again in 5 seconds
            setTimeout(checkTransaction, 5000);
          }
        } catch (err) {
          // Continue checking on error
          setTimeout(checkTransaction, 5000);
        }
      };

      checkTransaction();
    });
  };

  /**
   * Extracts game ID from transaction result
   */
  const extractGameIdFromTransaction = async (txId: string): Promise<number | null> => {
    try {
      const response = await fetch(`${networkUrl}/extended/v1/tx/${txId}`);
      const txData = await response.json();
      
      // Parse the transaction result to extract game ID
      if (txData.tx_result && txData.tx_result.repr) {
        const match = txData.tx_result.repr.match(/u(\d+)/);
        return match ? parseInt(match[1]) : null;
      }
      
      return null;
    } catch (err) {
      console.error('Error extracting game ID:', err);
      return null;
    }
  };

  /**
   * Basic Clarity value parser
   */
  const parseClarityValue = (clarityValue: string): any => {
    // This is a simplified parser - in production, use a proper Clarity parser
    try {
      if (clarityValue.startsWith('(some ')) {
        return { type: 'some', value: {} }; // Simplified parsing
      }
      if (clarityValue.startsWith('u')) {
        return parseInt(clarityValue.substring(1));
      }
      return clarityValue;
    } catch (err) {
      console.error('Error parsing Clarity value:', err);
      return null;
    }
  };

  /**
   * Resets the Web3 state
   */
  const resetWeb3State = (): void => {
    setContractGameData(null);
    setError(null);
    setStakingTxId(null);
    setIsStaking(false);
    setStakingComplete(false);
  };

  // Clear state when wallet disconnects
  useEffect(() => {
    if (!isAuthenticated) {
      resetWeb3State();
    }
  }, [isAuthenticated]);

  const value: Web3GameContextType = {
    contractGameData,
    isLoading,
    error,
    stakingTxId,
    isStaking,
    stakingComplete,
    createWeb3Game,
    joinWeb3Game,
    getGameDetails,
    calculateRewards,
    getMinStakeAmount,
    validateStakeAmount,
    formatStxAmount,
    stxToMicroStx,
    resetWeb3State,
  };

  return (
    <Web3GameContext.Provider value={value}>
      {children}
    </Web3GameContext.Provider>
  );
};

export const useWeb3Game = (): Web3GameContextType => {
  const context = useContext(Web3GameContext);
  if (!context) {
    throw new Error('useWeb3Game must be used within a Web3GameProvider');
  }
  return context;
};
