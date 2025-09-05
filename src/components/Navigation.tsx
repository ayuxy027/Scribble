const Navigation = () => {
    return (
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
    )
}

export default Navigation
