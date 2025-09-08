import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { Web3GameProvider } from './contexts/Web3GameContext';
import LandingPage from './pages/LandingPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import Web3Test from './components/Web3Test';

const App: React.FC = () => {
  return (
    <WalletProvider>
      <Web3GameProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/web3-test" element={<Web3Test />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Web3GameProvider>
    </WalletProvider>
  );
};

export default App;
