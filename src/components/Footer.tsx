import React from 'react';
import { Link } from 'react-router-dom';

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
                        <p className="text-xs text-gray-400 mt-2">
                            Built on Stacks Hacker House Goa 2025 by Team 404 Found.
                        </p>
                    </div>

                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">EXPLORE</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Gallery</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Artists</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Challenges</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Tutorials</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">COMMUNITY</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Forums</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Events</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">CONNECT</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Twitter</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Instagram</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Discord</Link></li>
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">YouTube</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>© 2025 FRA! Doodle Community. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;