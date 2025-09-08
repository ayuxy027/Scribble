import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useWeb3Game } from '../contexts/Web3GameContext';

interface GamePageProps {
  roomId: string;
  isHost: boolean;
}

const GamePage: React.FC<GamePageProps> = ({ roomId, isHost }) => {
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
  const [gamePhase, setGamePhase] = useState<'setup' | 'staking' | 'playing' | 'finished'>('setup');
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

    setGamePhase('staking');
    
    const result = await createWeb3Game(stakeAmount);
    
    if (result.success && result.gameId) {
      setContractGameId(result.gameId);
      setGamePhase('playing');
      console.log('Web3 game created successfully!', result.gameId);
    } else {
      setGamePhase('setup');
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

    setGamePhase('staking');
    
    const result = await joinWeb3Game(gameId);
    
    if (result.success) {
      setContractGameId(gameId);
      setGamePhase('playing');
      console.log('Joined Web3 game successfully!');
    } else {
      setGamePhase('setup');
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

  /**
   * Reset Web3 state when component unmounts
   */
  useEffect(() => {
    return () => {
      resetWeb3State();
    };
  }, [resetWeb3State]);

  /**
   * Render wallet connection section
   */
  const renderWalletSection = () => (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Wallet Connection</h3>
      {!isAuthenticated ? (
        <div>
          <p className="text-gray-600 mb-2">Connect your Leather wallet to enable Web3 gaming with STX staking</p>
          <button
            onClick={handleConnectWallet}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Connect Leather Wallet
          </button>
        </div>
      ) : (
        <div>
          <p className="text-green-600 mb-2">✅ Wallet Connected</p>
          <p className="text-sm text-gray-600">Address: {userAddress}</p>
        </div>
      )}
    </div>
  );

  /**
   * Render staking setup section
   */
  const renderStakingSetup = () => (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Web3 Game Setup</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stake Amount (STX)
        </label>
        <input
          type="number"
          min="1"
          max="100"
          step="0.1"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter stake amount (1-100 STX)"
        />
        <p className="text-sm text-gray-500 mt-1">
          Both players must stake the same amount to play
        </p>
      </div>
      
      {isHost ? (
        <button
          onClick={handleCreateStakedGame}
          disabled={isLoading || !isAuthenticated}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded"
        >
          {isLoading ? 'Creating Game...' : 'Create Staked Game'}
        </button>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">Waiting for host to set up Web3 game...</p>
          <button
            onClick={() => handleJoinStakedGame(1)} // This would come from props or state
            disabled={isLoading || !isAuthenticated}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded"
          >
            {isLoading ? 'Joining Game...' : 'Join Staked Game'}
          </button>
        </div>
      )}
    </div>
  );

  /**
   * Render staking progress section
   */
  const renderStakingProgress = () => (
    <div className="bg-yellow-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Staking in Progress</h3>
      <div className="flex items-center mb-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
        <span>Processing stake transaction...</span>
      </div>
      {stakingTxId && (
        <p className="text-sm text-gray-600">
          Transaction ID: {stakingTxId.slice(0, 8)}...{stakingTxId.slice(-8)}
        </p>
      )}
      <p className="text-sm text-gray-500 mt-2">
        Please confirm the transaction in your Leather wallet
      </p>
    </div>
  );

  /**
   * Render game info section
   */
  const renderGameInfo = () => (
    <div className="bg-green-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Game Information</h3>
      {contractGameData ? (
        <div>
          <p><strong>Game ID:</strong> {contractGameData.gameId}</p>
          <p><strong>Stake Amount:</strong> {formatStxAmount(contractGameData.stakeAmount)}</p>
          <p><strong>Total Pot:</strong> {formatStxAmount(contractGameData.totalPot)}</p>
          <p><strong>Players:</strong> {contractGameData.players.length}/2</p>
          <p><strong>Status:</strong> {contractGameData.state}</p>
        </div>
      ) : (
        <div>
          <p><strong>Room ID:</strong> {roomId}</p>
          <p><strong>Stake Amount:</strong> {formatStxAmount(stakeAmount * 1000000)}</p>
          <p><strong>Your Role:</strong> {isHost ? 'Host' : 'Player'}</p>
        </div>
      )}
    </div>
  );

  /**
   * Render error section
   */
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={resetWeb3State}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Reset and Try Again
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Scribble Game - Web3 Edition</h1>
      
      {renderError()}
      {renderWalletSection()}
      
      {gamePhase === 'setup' && renderStakingSetup()}
      {gamePhase === 'staking' && renderStakingProgress()}
      {(gamePhase === 'playing' || gamePhase === 'finished') && renderGameInfo()}
      
      {/* Game Canvas Area */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Game Area</h3>
        
        {gamePhase === 'setup' && (
          <div className="text-center py-8 text-gray-500">
            <p>Set up your Web3 game with STX staking to begin playing</p>
          </div>
        )}
        
        {gamePhase === 'staking' && (
          <div className="text-center py-8 text-gray-500">
            <p>Waiting for stake transaction to complete...</p>
          </div>
        )}
        
        {gamePhase === 'playing' && (
          <div className="text-center py-8">
            <p className="text-green-600 font-semibold">Game Active!</p>
            <p className="text-gray-600">Drawing canvas and game controls would go here</p>
            {stakingComplete && (
              <p className="text-sm text-green-500 mt-2">✅ Staking complete - Game ready to start!</p>
            )}
          </div>
        )}
        
        {gamePhase === 'finished' && (
          <div className="text-center py-8">
            <p className="text-blue-600 font-semibold">Game Finished!</p>
            <p className="text-gray-600">Results and reward distribution would be shown here</p>
          </div>
        )}
      </div>
      
      {/* Debug Information (for development) */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info</h4>
          <pre className="text-xs text-gray-600">
            {JSON.stringify({
              gamePhase,
              contractGameId,
              isAuthenticated,
              isStaking,
              stakingComplete,
              error
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GamePage;
