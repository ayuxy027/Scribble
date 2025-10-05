# Stakeboard - Blockchain Gaming Experience
> Built during Stacks Hacker House Goa Edition 2025

<div align="center">
  <img src="https://img.shields.io/badge/Stacks-Blockchain-593CFF?style=for-the-badge" alt="Stacks Blockchain">
  <img src="https://img.shields.io/badge/Smart%20Contract-Clarity-4A3A7E?style=for-the-badge" alt="Clarity Smart Contract">
  <img src="https://img.shields.io/badge/TypeScript-FF1F25?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
</div>

<br>

<div align="center">
  <img src="https://raw.githubusercontent.com/hirosystems/docs/main/public/img/stacks-apps/clarinet.svg" width="150" alt="Stacks Logo">
</div>

<br>

<div align="center">

[**Live Demo**](#) • [**Stacks Ecosystem**](https://www.stacks.co/) • [**Documentation**](https://docs.hiro.so/) • [**Smart Contract**](https://github.com/hirosystems/clarity)

</div>

## 🎯 The Basic Idea

**Stakeboard** transforms the classic drawing game experience by integrating blockchain technology and real cryptocurrency stakes. Players stake STX tokens to join drawing games where guessing the word correctly and successfully drawing earn points and rewards. The platform combines entertainment with DeFi mechanics, creating a unique play-to-earn experience on the Stacks blockchain.

The game enables users to create rooms, stake tokens, and compete in drawing challenges with real cryptocurrency rewards. This innovative approach merges social gaming with blockchain finance, creating engaging experiences where skill and luck both contribute to earning rewards.

## 🌟 Key Features

### 🪙 **Crypto Staking**
- Players stake STX tokens to join games
- Minimum stake requirement ensures committed participation
- Winners receive the entire pot minus platform fees
- Automatic refunds when games are canceled

### 🎨 **Real-time Drawing & Guessing**
- Interactive canvas for drawing
- Real-time multiplayer experience
- Word hint system with progressive reveals
- Round-based gameplay with turn rotations

### ⚡ **Smart Contract Integration**
- Clarity smart contracts on Stacks blockchain
- Automated reward distribution
- Secure STX token transfers
- Platform fee management (2.5% by default)

### 🌐 **Multiplayer Gaming**
- Room creation and joining
- Up to 20 players per game
- Host controls and game management
- Ready/lobby system for smooth gameplay

### 🔐 **Secure & Transparent**
- On-chain transactions
- Immutable game records
- Fair gameplay mechanics
- Anti-cheating measures

### 📊 **Rich Game Analytics**
- Real-time score tracking
- Player performance metrics
- Round and game history
- Comprehensive game state management

## 🏗 Technical Architecture

### Frontend
- **React** for user interface
- **Socket.IO** for real-time communication
- **TypeScript** for type safety
- Responsive design for all devices

### Backend
- **Node.js/Express** server
- **Socket.IO** for real-time multiplayer
- **MongoDB** for game state persistence
- Comprehensive room and user management

### Smart Contract
- **Clarity** smart contract (Stacks blockchain)
- Manages staking and reward distribution
- Automated game lifecycle management
- Fee collection and distribution

### Tech Stack
```text
┌─────────────────────────────────────────┐
│              Frontend                   │
├─────────────────────────────────────────┤
│ React + TypeScript + Socket.IO          │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│              Backend                    │
├─────────────────────────────────────────┤
│ Node.js + Express + MongoDB + Socket.IO │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         Stacks Blockchain               │
├─────────────────────────────────────────┤
│ Clarity Smart Contract + STX Tokens     │
└─────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Stacks Wallet or Hiro Wallet
- MongoDB (for backend persistence)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stakeboard.git
   cd stakeboard
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend  
   cd ../backend
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running locally
   mongod
   ```

4. **Run the application**
   ```bash
   # Terminal 1 - Start backend
   cd backend
   npm start
   
   # Terminal 2 - Start frontend
   cd frontend
   npm run dev
   ```

## 🎮 How to Play

1. **Create or Join a Room**
   - Connect with the Hiro Wallet
   - Create a new room or join an existing one
   - Stake the required amount of STX tokens

2. **Wait for Players**
   - Players can join until the game starts
   - Host starts the game when ready

3. **Play Rounds**
   - When your turn comes, choose a word to draw
   - Other players guess the word
   - Correct guessers earn points
   - Successful drawers also earn points

4. **Earn Rewards**
   - At game end, the winner receives the pot
   - Platform fee is automatically deducted
   - Tokens are transferred via smart contract

## 📊 Game Mechanics

### Scoring System
- **Correct Guess**: 10-150 points (based on time taken)
- **Successful Drawing**: 50 points per correct guess
- **First to Guess**: More points than later guessers

### Staking Rules
- Minimum stake: 1 STX
- All players must stake the same amount
- Winners receive the entire pot minus fees
- Automatic refunds for canceled games

### Game Flow
1. **Lobby Phase**: Players join and stake tokens
2. **Word Selection**: Drawer chooses from 3 options or auto-select
3. **Drawing Phase**: 30 seconds to draw with progressive hints
4. **Results Phase**: Points awarded and next round preparation
5. **Final Results**: Winner determination and reward distribution

## 🤖 Smart Contract Functions

### Game Management
- `create-game`: Create a new game room with specified stake
- `join-game`: Join an existing game by staking tokens
- `start-game`: Start the game (host only)
- `cancel-game`: Cancel game and refund all stakes (host/owner)
- `end-game`: End game and distribute rewards (backend only)

### Read-Only Functions
- `get-game-details`: Retrieve game state and information
- `get-player-stake`: Check individual player stakes
- `calculate-rewards`: Calculate potential rewards before game ends

### Administrative Functions
- `set-backend-server`: Update authorized backend server
- `set-platform-fee`: Adjust platform fee percentage (max 10%)

## 🔧 Configuration

### Contract Constants
- **MAX_PLAYERS**: 20 players per game
- **MIN_STAKE_AMOUNT**: 1,000,000 micro-STX (1 STX)
- **PLATFORM_FEE**: 250 basis points (2.5%)
- **ROUND_TIME**: 30 seconds per drawing round
- **HINT_REVEALS**: At 10s and 20s into drawing phase

## 🛡 Security & Auditing

- Smart contract code is open source and auditable
- All token transfers are handled securely via Clarity
- Game state is persisted using MongoDB with room-specific collections
- Anti-cheating measures prevent unauthorized access to game words

## 🏆 Use Cases

### Casual Gaming
- Fun drawing competitions with friends
- Small stake amounts for entertainment

### Competitive Gaming  
- High-stakes tournaments
- Professional drawing challenges

### Community Building
- Social interaction through gameplay
- Shared gaming experiences

### Educational
- Learning about blockchain through gaming
- Understanding DeFi concepts in practice

## 🌐 Community & Support

- Join our community on Discord
- Follow us on Twitter for updates
- Contribute to development on GitHub
- Report issues in the issue tracker

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🔮 Future Roadmap

- [ ] Cross-chain token support
- [ ] Enhanced drawing tools and brushes
- [ ] Tournament mode with brackets
- [ ] NFT rewards and collectibles
- [ ] Mobile app development
- [ ] AI-assisted drawing tools
- [ ] Voice chat integration
- [ ] Custom room settings and rules

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built during the amazing **Stacks Hacker House Goa Edition 2025**
- Powered by the incredible **Stacks blockchain ecosystem**
- Inspired by the vibrant **Stacks developer community**
- Special thanks to **Hiro Systems** for Clarinet and Stacks tooling

---

<div align="center">

*Stakeboard - Where Art Meets Blockchain*

✨ Built with ❤️ during Stacks Hacker House Goa Edition 2025 ✨

</div>