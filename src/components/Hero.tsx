import BannerPng from '../assets/banner.png';
import Panda from './Panda';

const Hero = () => {
    return (
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
                <div className="h-[400px] flex items-end justify-center">
                    <img
                        src={BannerPng}
                        alt="Hero Banner with doodle characters"
                        className="w-screen h-full object-cover object-bottom"
                    />
                </div>
            </div>

        </div>
    )
}

export default Hero