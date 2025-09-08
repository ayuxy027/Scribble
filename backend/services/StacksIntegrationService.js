const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const { 
  makeContractCall,
  makeReadOnlyCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createAssetInfo,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  bufferCVFromString,
  uintCV,
  principalCV,
  stringAsciiCV,
  listCV
} = require('@stacks/transactions');
const { StacksApiSocketClient } = require('@stacks/blockchain-api-client');

class StacksIntegrationService {
  constructor() {
    // Use testnet for development, mainnet for production
    this.network = process.env.NODE_ENV === 'production' 
      ? new StacksMainnet() 
      : new StacksTestnet();
    
    this.contractAddress = process.env.CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = process.env.CONTRACT_NAME || 'scribble-stake';
    this.senderKey = process.env.STACKS_PRIVATE_KEY; // Backend server private key
    
    // Initialize WebSocket client for transaction monitoring
    this.wsClient = new StacksApiSocketClient({
      url: this.network.coreApiUrl,
      socketOpts: { transports: ['websocket'] }
    });
  }

  /**
   * Creates a new game in the smart contract
   * @param {string} hostAddress - The host's wallet address
   * @param {number} stakeAmount - Stake amount in microSTX
   * @returns {Promise<object>} - Transaction result with game ID
   */
  async createGame(hostAddress, stakeAmount) {
    try {
      const functionArgs = [uintCV(stakeAmount)];
      
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'create-game',
        functionArgs,
        senderKey: this.senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        success: true,
        txId: broadcastResponse.txid,
        transaction: transaction
      };
    } catch (error) {
      console.error('Error creating game in contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Allows a player to join an existing game
   * @param {number} gameId - The contract game ID
   * @param {string} playerAddress - Player's wallet address
   * @returns {Promise<object>} - Transaction result
   */
  async joinGame(gameId, playerAddress) {
    try {
      const functionArgs = [uintCV(gameId)];
      
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'join-game',
        functionArgs,
        senderKey: this.senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        success: true,
        txId: broadcastResponse.txid,
        transaction: transaction
      };
    } catch (error) {
      console.error('Error joining game in contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Starts a game in the smart contract
   * @param {number} gameId - The contract game ID
   * @returns {Promise<object>} - Transaction result
   */
  async startGame(gameId) {
    try {
      const functionArgs = [uintCV(gameId)];
      
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'start-game',
        functionArgs,
        senderKey: this.senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        success: true,
        txId: broadcastResponse.txid,
        transaction: transaction
      };
    } catch (error) {
      console.error('Error starting game in contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ends a game and distributes rewards to the winner
   * @param {number} gameId - The contract game ID
   * @param {string} winnerAddress - Winner's wallet address
   * @returns {Promise<object>} - Transaction result
   */
  async endGame(gameId, winnerAddress) {
    try {
      const functionArgs = [
        uintCV(gameId),
        principalCV(winnerAddress)
      ];
      
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'end-game',
        functionArgs,
        senderKey: this.senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        success: true,
        txId: broadcastResponse.txid,
        transaction: transaction
      };
    } catch (error) {
      console.error('Error ending game in contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ends a game with multiple winners (tie scenario)
   * @param {number} gameId - The contract game ID
   * @param {string[]} winnerAddresses - Array of winner wallet addresses
   * @returns {Promise<object>} - Transaction result
   */
  async endGameTie(gameId, winnerAddresses) {
    try {
      const winnersCV = listCV(winnerAddresses.map(addr => principalCV(addr)));
      const functionArgs = [
        uintCV(gameId),
        winnersCV
      ];
      
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'end-game-tie',
        functionArgs,
        senderKey: this.senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        success: true,
        txId: broadcastResponse.txid,
        transaction: transaction
      };
    } catch (error) {
      console.error('Error ending game with tie in contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancels a game and refunds all players
   * @param {number} gameId - The contract game ID
   * @returns {Promise<object>} - Transaction result
   */
  async cancelGame(gameId) {
    try {
      const functionArgs = [uintCV(gameId)];
      
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'cancel-game',
        functionArgs,
        senderKey: this.senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);
      
      return {
        success: true,
        txId: broadcastResponse.txid,
        transaction: transaction
      };
    } catch (error) {
      console.error('Error canceling game in contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gets game details from the smart contract
   * @param {number} gameId - The contract game ID
   * @returns {Promise<object>} - Game details
   */
  async getGameDetails(gameId) {
    try {
      const functionArgs = [uintCV(gameId)];
      
      const contractCall = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-game-details',
        functionArgs,
        network: this.network,
        senderAddress: this.contractAddress,
      };

      const result = await makeReadOnlyCall(contractCall);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error getting game details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gets the minimum stake amount required
   * @returns {Promise<number>} - Minimum stake amount in microSTX
   */
  async getMinStakeAmount() {
    try {
      const contractCall = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-min-stake-amount',
        functionArgs: [],
        network: this.network,
        senderAddress: this.contractAddress,
      };

      const result = await makeReadOnlyCall(contractCall);
      return result.value ? parseInt(result.value) : 1000000; // Default 1 STX
    } catch (error) {
      console.error('Error getting min stake amount:', error);
      return 1000000; // Default 1 STX
    }
  }

  /**
   * Calculates expected rewards for a game
   * @param {number} gameId - The contract game ID
   * @returns {Promise<object>} - Expected rewards breakdown
   */
  async calculateRewards(gameId) {
    try {
      const functionArgs = [uintCV(gameId)];
      
      const contractCall = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'calculate-rewards',
        functionArgs,
        network: this.network,
        senderAddress: this.contractAddress,
      };

      const result = await makeReadOnlyCall(contractCall);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error calculating rewards:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Monitors a transaction until completion
   * @param {string} txId - Transaction ID to monitor
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<object>} - Transaction status
   */
  async waitForTransaction(txId, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Transaction timeout'));
      }, timeoutMs);

      this.wsClient.subscribeAddressTransactions([this.contractAddress], (event) => {
        if (event.tx_id === txId) {
          clearTimeout(timeout);
          resolve({
            success: event.tx_status === 'success',
            status: event.tx_status,
            event: event
          });
        }
      });
    });
  }

  /**
   * Validates a Stacks address
   * @param {string} address - Address to validate
   * @returns {boolean} - Whether the address is valid
   */
  validateStacksAddress(address) {
    // Basic validation for Stacks addresses
    return /^S[TPMNX][0-9A-HJKMNP-Z]{38}$/.test(address);
  }

  /**
   * Converts STX to microSTX
   * @param {number} stx - Amount in STX
   * @returns {number} - Amount in microSTX
   */
  stxToMicroStx(stx) {
    return Math.floor(stx * 1000000);
  }

  /**
   * Converts microSTX to STX
   * @param {number} microStx - Amount in microSTX
   * @returns {number} - Amount in STX
   */
  microStxToStx(microStx) {
    return microStx / 1000000;
  }
}

module.exports = StacksIntegrationService;
