import BannerPng from '../assets/banner.png';
import CTAPng from '../assets/cta.png';
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
            <div className="min-h-screen bg-white py-20 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between gap-16">
                        {/* Left Side - Text Content */}
                        <div className="flex-1 max-w-2xl">
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-8">
                                <div className="block">READY TO JOIN THE</div>
                                <div className="block my-4">
                                    <span className="text-5xl md:text-7xl lg:text-8xl">FRA!</span>
                                    <span className="inline-block w-12 h-12 md:w-16 md:h-16 -mx-1 align-middle">
                                        <Panda size="md" />
                                    </span>
                                    <span className="inline-block w-12 h-12 md:w-16 md:h-16 -mx-1 align-middle" style={{ transform: 'rotate(-15deg)' }}>
                                        <Panda size="md" />
                                    </span>
                                </div>
                                <div className="block">COMMUNITY?</div>
                            </h2>

                            {/* Description */}
                            <div className="mb-12">
                                <p className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed mb-4">
                                    Be part of the most <span className="font-black">creative</span>,
                                    <span className="font-black"> fun</span>, and
                                    <span className="font-black"> doodle-licious</span> community on the internet.
                                </p>
                                <p className="text-base md:text-lg text-gray-600">
                                    Share your art, connect with fellow creators, and get inspired daily.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-6">
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

                        {/* Right Side - CTA Image */}
                        <div className="flex-shrink-0 w-80 md:w-96">
                            <img
                                src={CTAPng}
                                alt="Built on Stack - Creative Platform"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero