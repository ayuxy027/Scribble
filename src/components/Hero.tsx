import BannerPng from '../assets/banner.png';
import Panda from './Panda';

const Hero = () => {
    return (
        <div className="bg-white relative overflow-hidden">
            {/* Main Hero Section */}
            <div className="min-h-screen bg-white relative overflow-hidden">
                {/* Main Content */}
                <div className="flex flex-col items-center justify-start pt-20 min-h-screen px-8 relative z-20">

                    {/* Main welcome text */}
                    <div className="text-center max-w-4xl">
                        <h1 className="text-6xl md:text-8xl font-black leading-none">
                            <div className="block">BENVENUT* NELLA</div>
                            <div className="block my-4">
                                <span>D</span>
                                <span className="inline-block w-16 h-16 md:w-20 md:h-20 -mx-0 align-middle">
                                    <Panda size="md" />
                                </span>
                                <span className="inline-block w-16 h-16 md:w-20 md:h-20 -mx-2 align-middle" style={{ transform: 'rotate(30deg)' }}>
                                    <Panda size="md" />
                                </span>
                                <span>DLE</span>
                            </div>
                            <div className="block">ART DI FRA!</div>
                        </h1>
                    </div>
                </div>

                {/* Bottom section - Hero Banner */}
                <div className="absolute bottom-0 left-0 right-0 bg-white z-10">
                    <div className="h-[450px] flex items-end justify-center">
                        <img
                            src={BannerPng}
                            alt="Hero Banner with doodle characters"
                            className="w-screen h-full object-cover object-bottom"
                        />
                    </div>
                </div>
            </div>

            {/* CTA Section - Creative & Classy */}
            <div className="min-h-screen bg-white relative overflow-hidden">
                {/* Main CTA Content */}
                <div className="flex flex-col items-center justify-center min-h-screen px-8 relative z-20">
                    <div className="text-center max-w-4xl">
                        <h2 className="text-5xl md:text-7xl font-black leading-none mb-8">
                            <div className="block">READY TO JOIN THE</div>
                            <div className="block my-4">
                                <span className="text-6xl md:text-8xl">FRA!</span>
                                <span className="inline-block w-16 h-16 md:w-20 md:h-20 -mx-1 align-middle">
                                    <Panda size="md" />
                                </span>
                                <span className="inline-block w-16 h-16 md:w-20 md:h-20 -mx-1 align-middle" style={{ transform: 'rotate(-15deg)' }}>
                                    <Panda size="md" />
                                </span>
                            </div>
                            <div className="block">COMMUNITY?</div>
                        </h2>
                    </div>

                    {/* Creative Description */}
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <p className="text-xl md:text-2xl font-medium leading-relaxed">
                            Be part of the most <span className="font-black">creative</span>,
                            <span className="font-black"> fun</span>, and
                            <span className="font-black"> doodle-licious</span> community on the internet.
                        </p>
                        <p className="text-lg md:text-xl mt-4 text-gray-600">
                            Share your art, connect with fellow creators, and get inspired daily.
                        </p>
                    </div>

                    {/* Creative Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button className="bg-black text-white px-10 py-5 rounded-full text-xl font-black hover:bg-gray-800 transition-colors relative">
                            <span>SIGN UP NOW</span>
                            <span className="absolute -top-2 -right-2 w-6 h-6">
                                <Panda size="sm" />
                            </span>
                        </button>
                        <button className="border-2 border-black px-10 py-5 rounded-full text-xl font-black hover:bg-black hover:text-white transition-colors relative">
                            <span>LEARN MORE</span>
                            <span className="absolute -top-2 -right-2 w-6 h-6" style={{ transform: 'rotate(45deg)' }}>
                                <Panda size="sm" />
                            </span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Hero