import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useWeb3Game } from '../contexts/Web3GameContext';

const Web3Test: React.FC = () => {
  const { isAuthenticated, userAddress, connectWallet } = useWallet();
  const { validateStakeAmount, formatStxAmount, stxToMicroStx } = useWeb3Game();

  const testStake = 5; // 5 STX

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Web3 Integration Test</h2>
      
      <div className="space-y-3">
        <div>
          <strong>Wallet Status:</strong> {isAuthenticated ? '✅ Connected' : '❌ Not Connected'}
        </div>
        
        {userAddress && (
          <div>
            <strong>Address:</strong> {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
          </div>
        )}
        
        <div>
          <strong>Test Stake Amount:</strong> {testStake} STX
        </div>
        
        <div>
          <strong>In MicroSTX:</strong> {stxToMicroStx(testStake).toLocaleString()}
        </div>
        
        <div>
          <strong>Formatted:</strong> {formatStxAmount(stxToMicroStx(testStake))}
        </div>
        
        <div>
          <strong>Valid Stake:</strong> {validateStakeAmount(testStake) ? '✅ Yes' : '❌ No'}
        </div>
        
        {!isAuthenticated && (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Test Wallet Connection
          </button>
        )}
      </div>
    </div>
  );
};

export default Web3Test;
