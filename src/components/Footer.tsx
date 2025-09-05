import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black text-white py-12 px-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <div className="bg-white text-black px-4 py-2 rounded-full inline-block mb-4">
                            <div className="text-2xl font-bold">STAKEBOARD</div>
                        </div>
                        <p className="text-gray-300 mb-4">
                            The ultimate web3 doodle battle arena where creativity meets crypto rewards.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Built on Stacks Hacker House Goa 2025 by Team 404 Found.
                        </p>
                    </div>

                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">GAME</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Leaderboard</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Draw Arena</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Rewards</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">How to Play</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">COMMUNITY</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Discord</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Tournaments</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Winners</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">WEB3</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Connect Wallet</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Stacks Network</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Smart Contracts</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Documentation</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>© 2025 StakeBoard - Web3 Doodle Battle Arena. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;