import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useWeb3Game } from '../contexts/Web3GameContext';

interface Web3IntegrationProps {
  roomId?: string; // Optional since it's not currently used but may be needed for future features
  isHost: boolean;
  gameActive: boolean;
  onWeb3GameCreated?: (gameId: number) => void;
  onWeb3GameJoined?: (gameId: number) => void;
}

const Web3Integration: React.FC<Web3IntegrationProps> = ({
  isHost,
  gameActive,
  onWeb3GameCreated,
  onWeb3GameJoined
}) => {
  const { isAuthenticated, userAddress, connectWallet } = useWallet();
  const {
    contractGameData,
    isLoading,
    error,
    stakingTxId,
    isStaking,
    stakingComplete,
    createWeb3Game,
    joinWeb3Game,
    getGameDetails,
    validateStakeAmount,
    formatStxAmount,
    resetWeb3State,
  } = useWeb3Game();

  const [stakeAmount, setStakeAmount] = useState<number>(1);
  const [showStakeSetup, setShowStakeSetup] = useState(false);
  const [contractGameId, setContractGameId] = useState<number | null>(null);

  /**
   * Handle wallet connection
   */
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  /**
   * Handle creating a Web3 game with staking
   */
  const handleCreateStakedGame = async () => {
    if (!isAuthenticated) {
      await handleConnectWallet();
      return;
    }

    if (!validateStakeAmount(stakeAmount)) {
      alert('Invalid stake amount. Please enter between 1-100 STX.');
      return;
    }

    const result = await createWeb3Game(stakeAmount);
    
    if (result.success && result.gameId) {
      setContractGameId(result.gameId);
      setShowStakeSetup(false);
      onWeb3GameCreated?.(result.gameId);
      console.log('Web3 game created successfully!', result.gameId);
    } else {
      alert(`Failed to create Web3 game: ${result.error}`);
    }
  };

  /**
   * Handle joining a Web3 game with staking
   */
  const handleJoinStakedGame = async (gameId: number) => {
    if (!isAuthenticated) {
      await handleConnectWallet();
      return;
    }

    const result = await joinWeb3Game(gameId);
    
    if (result.success) {
      setContractGameId(gameId);
      setShowStakeSetup(false);
      onWeb3GameJoined?.(gameId);
      console.log('Joined Web3 game successfully!');
    } else {
      alert(`Failed to join Web3 game: ${result.error}`);
    }
  };

  /**
   * Load game details if contract game ID is available
   */
  useEffect(() => {
    if (contractGameId) {
      getGameDetails(contractGameId).then(details => {
        if (details) {
          console.log('Game details loaded:', details);
        }
      });
    }
  }, [contractGameId, getGameDetails]);

  if (gameActive && !stakingComplete) {
    return null; // Don't show during active game unless staking is complete
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-3 flex items-center">
        🔥 Web3 Gaming Mode
      </h3>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-300 p-3 rounded mb-3">
          <p className="text-sm">{error}</p>
          <button
            onClick={resetWeb3State}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
          >
            Reset
          </button>
        </div>
      )}

      {/* Wallet Connection */}
      {!isAuthenticated ? (
        <div className="mb-4">
          <p className="text-sm mb-2">Connect your Leather wallet to enable STX staking</p>
          <button
            onClick={handleConnectWallet}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm mb-1">✅ Wallet Connected</p>
          <p className="text-xs opacity-80">
            {userAddress?.slice(0, 8)}...{userAddress?.slice(-6)}
          </p>
        </div>
      )}

      {/* Staking Status */}
      {stakingComplete && contractGameData && (
        <div className="bg-green-500 bg-opacity-20 border border-green-300 p-3 rounded mb-3">
          <p className="text-sm font-medium">🎯 Staked Game Active</p>
          <p className="text-xs">Stake: {formatStxAmount(contractGameData.stakeAmount)}</p>
          <p className="text-xs">Pot: {formatStxAmount(contractGameData.totalPot)}</p>
        </div>
      )}

      {/* Staking in Progress */}
      {isStaking && (
        <div className="bg-yellow-500 bg-opacity-20 border border-yellow-300 p-3 rounded mb-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Processing stake...</span>
          </div>
          {stakingTxId && (
            <p className="text-xs mt-1 opacity-80">
              TX: {stakingTxId.slice(0, 8)}...
            </p>
          )}
        </div>
      )}

      {/* Stake Setup */}
      {isAuthenticated && !stakingComplete && !isStaking && (
        <div>
          {!showStakeSetup ? (
            <button
              onClick={() => setShowStakeSetup(true)}
              disabled={gameActive}
              className="bg-white text-purple-600 hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 px-4 py-2 rounded font-medium w-full"
            >
              {gameActive ? 'Game in Progress' : '💰 Start Staked Game'}
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stake Amount (STX)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-black rounded focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="1-100 STX"
                />
                <p className="text-xs opacity-80 mt-1">
                  Both players stake the same amount
                </p>
              </div>
              
              <div className="flex gap-2">
                {isHost ? (
                  <button
                    onClick={handleCreateStakedGame}
                    disabled={isLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded font-medium"
                  >
                    {isLoading ? 'Creating...' : 'Create Game'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinStakedGame(1)} // This would come from host
                    disabled={isLoading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded font-medium"
                  >
                    {isLoading ? 'Joining...' : 'Join Game'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowStakeSetup(false)}
                  className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Text */}
      {!stakingComplete && !isStaking && (
        <p className="text-xs opacity-80 mt-3 text-center">
          Win the game to claim the entire pot! 🏆
        </p>
      )}
    </div>
  );
};

export default Web3Integration;
