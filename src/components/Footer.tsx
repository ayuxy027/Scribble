import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 border-t border-gray-700">
            <div className="container mx-auto px-6 py-16">
                {/* Main Footer Content */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h3 className="text-3xl font-bold text-red-500 font-mono mb-4">SCRIBBLE</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Where creativity meets blockchain technology. The ultimate drawing championship
                                powered by decentralized gaming.
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                                <span className="text-white">🐦</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                                <span className="text-white">💬</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                                <span className="text-white">📱</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                                <span className="text-white">🔗</span>
                            </a>
                        </div>
                    </div>

                    {/* Game Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-yellow-400 font-mono">GAME</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    How to Play
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Leaderboard
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Tournaments
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Rewards
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Game Rules
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Blockchain Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-cyan-400 font-mono">BLOCKCHAIN</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Smart Contracts
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Tokenomics
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Security Audit
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Whitepaper
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Roadmap
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-purple-400 font-mono">COMMUNITY</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Discord
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Twitter
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Telegram
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-700 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        {/* Copyright */}
                        <div className="text-gray-500 text-sm font-mono">
                            © 2024 SCRIBBLE BLOCKCHAIN. ALL RIGHTS RESERVED.
                        </div>

                        {/* Additional Links */}
                        <div className="flex space-x-8 text-sm">
                            <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300">
                                Terms of Service
                            </a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors duration-300">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-cyan-400 opacity-20"></div>
            </div>
        </footer>
    );
};

export default Footer;
