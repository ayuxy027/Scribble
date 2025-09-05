const Navigation = () => {
    return (
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-50">
            <div className="flex flex-col gap-4">
                <div className="bg-black text-white px-4 py-2 rounded-full relative">
                    <div className="text-2xl font-bold">STAKEBOARD</div>
                    <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                </div>
            </div>
            <div className="flex gap-4 relative z-50">
                <a
                    href="https://github.com/ayuxy027/Scribble"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-black rounded-full px-6 py-2 cursor-pointer hover:bg-black hover:text-white transition-colors bg-white relative z-50"
                >
                    <div className="text-lg font-bold uppercase">GITHUB</div>
                </a>
                <a
                    href="https://x.com/stakeboard_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-black rounded-full px-6 py-2 cursor-pointer hover:bg-black hover:text-white transition-colors bg-white relative z-50"
                >
                    <div className="text-lg font-bold uppercase">X</div>
                </a>
            </div>
        </div>
    )
}

export default Navigation
