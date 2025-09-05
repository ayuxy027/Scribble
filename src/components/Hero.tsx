import HeroBanner from '../assets/Hero-Banner.png';
import Navigation from './Navigation';

const Hero = () => {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            <Navigation />

            {/* Main Content */}
            <div className="flex flex-col items-center justify-start pt-20 min-h-screen px-8 relative z-20">

                {/* Main welcome text */}
                <div className="text-center max-w-4xl">
                    <h1 className="text-6xl md:text-8xl font-black leading-tight relative">
                        <span>BENVENUT* NELLA D</span>
                        {/* First O replaced with panda */}
                        <span className="inline-block w-16 h-16 md:w-20 md:h-20 relative">
                            <div className="w-16 h-full bg-white border-2 border-black rounded-3xl relative">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                    <div className="w-1 h-1 bg-black rounded-full absolute top-0 left-3"></div>
                                    <div className="w-1 h-1 bg-black rounded-full absolute top-0 right-3"></div>
                                    <div className="w-3 h-1 bg-black rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
                                </div>
                            </div>
                        </span>
                        {/* Second O replaced with panda */}
                        <span className="inline-block w-16 h-16 md:w-20 md:h-20 relative">
                            <div className="w-16 h-full bg-white border-2 border-black rounded-3xl relative">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                    <div className="w-1 h-1 bg-black rounded-full absolute top-0 left-3"></div>
                                    <div className="w-1 h-1 bg-black rounded-full absolute top-0 right-3"></div>
                                    <div className="w-3 h-1 bg-black rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
                                </div>
                            </div>
                        </span>
                        <span>DLE ART DI FRA!</span>
                    </h1>
                </div>
            </div>

            {/* Bottom section - Hero Banner */}
            <div className="absolute bottom-0 left-0 right-0 bg-white z-10">
                <div className="h-[400px] flex items-end justify-center">
                    <img
                        src={HeroBanner}
                        alt="Hero Banner with doodle characters"
                        className="w-screen h-full object-cover object-bottom"
                    />
                </div>
            </div>

        </div>
    )
}

export default Hero