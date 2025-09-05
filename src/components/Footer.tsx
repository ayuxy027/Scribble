import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black text-white py-12 px-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <div className="bg-white text-black px-4 py-2 rounded-full inline-block mb-4">
                            <div className="text-2xl font-bold">FRA!</div>
                        </div>
                        <p className="text-gray-300 mb-4">
                            The ultimate doodle art community for creative minds.
                        </p>
                    </div>
                    
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">EXPLORE</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Gallery</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Artists</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Challenges</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tutorials</a></li>
                        </ul>
                    </div>
                    
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">COMMUNITY</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Forums</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Events</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Support</a></li>
                        </ul>
                    </div>
                    
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">CONNECT</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Instagram</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Discord</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">YouTube</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>© 2023 FRA! Doodle Community. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;