import React from 'react';

const CTAPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white py-20 px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-5xl md:text-7xl font-black mb-8">
                    READY TO JOIN THE <span className="text-6xl md:text-8xl">FRA!</span> COMMUNITY?
                </h2>
                <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
                    Be part of the most creative, fun, and doodle-licious community on the internet. 
                    Share your art, connect with fellow creators, and get inspired daily.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button className="bg-black text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-gray-800 transition-colors">
                        SIGN UP NOW
                    </button>
                    <button className="border-2 border-black px-8 py-4 rounded-full text-xl font-bold hover:bg-black hover:text-white transition-colors">
                        LEARN MORE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CTAPage;