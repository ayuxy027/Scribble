import React from 'react';

const CTA: React.FC = () => {
    return (
        <section className="py-20 bg-slate-800 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center space-y-16">
                    {/* Title */}
                    <div className="space-y-4">
                        <h2 className="text-4xl lg:text-6xl font-bold text-white">
                            <span className="block text-red-500 font-mono text-2xl lg:text-3xl mb-4">READY TO DOMINATE?</span>
                            <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Join the Ultimate Drawing Championship
                            </span>
                        </h2>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <div className="bg-slate-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8 hover:border-red-500 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
                            <div className="text-6xl mb-6">🎯</div>
                            <h3 className="text-2xl font-bold text-red-400 mb-4 font-mono">Stake & Play</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Deposit tokens to enter matches. The more you stake, the bigger the rewards and the higher the stakes become.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8 hover:border-yellow-500 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                            <div className="text-6xl mb-6">🏆</div>
                            <h3 className="text-2xl font-bold text-yellow-400 mb-4 font-mono">Winner Takes All</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Prove your artistic skills and claim the entire prize pool for yourself. No sharing, no compromises.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8 hover:border-cyan-500 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                            <div className="text-6xl mb-6">📈</div>
                            <h3 className="text-2xl font-bold text-cyan-400 mb-4 font-mono">Leaderboard Rewards</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Climb the ranks and earn exclusive rewards for top performers. Stay consistent to maximize your earnings.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 min-w-[200px]">
                            💎 CONNECT WALLET
                        </button>
                        <button className="border-2 border-gray-500 hover:border-cyan-400 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:bg-cyan-400/10 min-w-[200px]">
                            🎨 TRY DEMO
                        </button>
                    </div>

                    {/* Features Note */}
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-8 text-gray-400 font-mono text-sm">
                            <span className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Instant matches</span>
                            </span>
                            <span className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                <span>Secure blockchain</span>
                            </span>
                            <span className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                <span>Cross-platform</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 border border-red-500/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 border border-yellow-400/30 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
        </section>
    );
};

export default CTA;
