import React from 'react';

interface PandaProps {
    size?: 'sm' | 'md' | 'lg';
}

const Panda: React.FC<PandaProps> = ({ size = 'md' }) => {
    // Define sizes
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-17',
        lg: 'w-20 h-20'
    };
    
    const eyeSize = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5'
    };
    
    const noseSize = {
        sm: 'w-2 h-0.5',
        md: 'w-3 h-1',
        lg: 'w-4 h-1.5'
    };

    return (
        <div className={`${sizeClasses[size]} bg-white border-4 border-black rounded-3xl relative`}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`${eyeSize[size]} bg-black rounded-full`}></div>
                <div className={`${eyeSize[size]} bg-black rounded-full absolute top-0 left-3`}></div>
                <div className={`${eyeSize[size]} bg-black rounded-full absolute top-0 right-3`}></div>
                <div className={`${noseSize[size]} bg-black rounded-full absolute top-2 left-1/2 transform -translate-x-1/2`}></div>
            </div>
        </div>
    );
};

export default Panda;
