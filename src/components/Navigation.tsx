const Navigation = () => {
    return (
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
            <div className="flex flex-col gap-4">
                <div className="bg-black text-white px-4 py-2 rounded-full relative">
                    <div className="text-2xl font-bold">FRA!</div>
                    <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                </div>
            </div>
            <div className="border-2 border-black rounded-full px-6 py-2 cursor-pointer">
                <div className="text-lg font-bold uppercase">MENU</div>
            </div>
        </div>
    )
}

export default Navigation
