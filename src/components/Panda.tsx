const Panda = () => {
    return (
        <>
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
        </>
    )
}

export default Panda
