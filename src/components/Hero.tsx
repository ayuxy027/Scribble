import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/20 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-32 w-24 h-24 bg-cyan-400/20 rounded-full animate-bounce"></div>
                <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-yellow-400/20 rounded-full animate-ping"></div>
                <div className="absolute bottom-20 right-20 w-16 h-16 bg-purple-500/20 rounded-full animate-pulse"></div>
            </div>

            <div className="container mx-auto px-6 py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {/* Badge */}
                        <div className="inline-block bg-red-600/20 border border-red-500 px-4 py-2 rounded-lg">
                            <span className="text-red-400 text-sm font-mono tracking-wider">🎮 BLOCKCHAIN GAMING REVOLUTION</span>
                        </div>

                        {/* Main Title */}
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                                <span className="block bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                                    SCRIBBLE
                                </span>
                                <span className="block text-yellow-400 text-3xl lg:text-4xl mt-2">
                                    BLOCKCHAIN EDITION
                                </span>
                            </h1>
                        </div>

                        {/* Description */}
                        <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                            Stake your tokens, unleash your creativity, and claim victory in the ultimate
                            blockchain-powered drawing battle. Winner takes all in this revolutionary
                            gaming experience where art meets cryptocurrency.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 py-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-500 mb-2">$2.4M</div>
                                <div className="text-sm text-gray-400 font-mono">Total Prize Pool</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400 mb-2">15.2K</div>
                                <div className="text-sm text-gray-400 font-mono">Active Players</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-400 mb-2">847</div>
                                <div className="text-sm text-gray-400 font-mono">Games Played</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25">
                                🚀 START PLAYING
                            </button>
                            <button className="border-2 border-gray-600 hover:border-red-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-red-500/10">
                                📊 VIEW LEADERBOARD
                            </button>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <div className="relative">
                            {/* Game Preview Screen */}
                            <div className="bg-slate-800 border-4 border-gray-600 rounded-2xl p-8 shadow-2xl">
                                <div className="bg-slate-900 rounded-lg p-6 h-80 flex flex-col justify-between">
                                    {/* Drawing Area */}
                                    <div className="flex justify-center items-center space-x-4">
                                        <div className="w-12 h-12 bg-red-500 rounded animate-bounce"></div>
                                        <div className="w-12 h-12 bg-yellow-400 rounded animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-12 h-12 bg-cyan-400 rounded animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>

                                    {/* Blockchain Indicator */}
                                    <div className="flex justify-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
            </div>
        </section>
    );
};

export default Hero;
