import HeroBanner from '../assets/Hero-Banner.png';
import Navigation from './Navigation';
import Panda from './Panda';

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
                        <Panda />
                        <Panda />
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