const Panda = () => {
    return (
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
    );
};

export default Panda;
