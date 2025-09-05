const Hero = () => {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Top Navigation */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
                {/* Left side - FRA! speech bubble and 56 PROGETTI */}
                <div className="flex flex-col gap-4">
                    {/* FRA! Speech bubble */}
                    <div className="bg-black text-white px-4 py-2 rounded-full relative">
                        <div className="text-2xl font-bold">FRA!</div>
                        {/* Speech bubble tail */}
                        <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                    </div>

                    {/* 56 PROGETTI */}
                    <div className="border-2 border-black p-4">
                        <div className="text-6xl font-black">56</div>
                        <div className="text-sm font-bold uppercase">PROGETTI</div>
                    </div>
                </div>

                {/* Right side - MENU button */}
                <div className="border-2 border-black rounded-full px-6 py-2">
                    <div className="text-lg font-bold uppercase">MENU</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center min-h-screen px-8 relative">
                {/* Cloud doodles around text */}
                <div className="absolute left-1/4 top-1/3 transform -translate-y-1/2">
                    <div className="w-24 h-16 bg-white border-2 border-black rounded-full relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-black rounded-full absolute top-0 left-3"></div>
                            <div className="w-1 h-1 bg-black rounded-full absolute top-0 right-3"></div>
                            <div className="w-3 h-1 bg-black rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                    </div>
                </div>

                <div className="absolute right-1/4 top-1/4 transform -translate-y-1/2">
                    <div className="w-16 h-12 bg-yellow-300 border-2 border-black rounded-full"></div>
                </div>

                <div className="absolute right-1/3 top-1/2 transform -translate-y-1/2">
                    <div className="w-12 h-8 bg-yellow-300 border-2 border-black rounded-full"></div>
                </div>

                {/* Main welcome text */}
                <div className="text-center max-w-4xl">
                    <h1 className="text-6xl md:text-8xl font-black leading-tight mb-4">
                        BENVENUT* NELLA DOODLE ART DI FRA!
                    </h1>
                    <p className="text-xl font-bold">(SCROLLA)</p>
                </div>
            </div>

            {/* Bottom section - space for character SVGs */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white">
                {/* This space is reserved for character SVGs */}
                <div className="h-full flex items-end justify-center">
                    <div className="text-gray-400 text-sm">Space for character SVGs</div>
                </div>
            </div>

            {/* SHOWREEL button */}
            <div className="absolute bottom-8 right-8">
                <div className="w-24 h-24 bg-yellow-300 border-2 border-black rounded-full flex items-center justify-center relative">
                    <div className="text-xs font-bold text-center">
                        <div>SHOWREEL</div>
                        <div>SHOWREEL</div>
                    </div>
                    {/* Winking face in center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full absolute top-0 right-2"></div>
                        <div className="w-2 h-1 bg-black rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero