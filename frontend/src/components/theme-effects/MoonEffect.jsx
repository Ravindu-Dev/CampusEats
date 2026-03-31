import React from 'react';

const MoonEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden bg-black/10">
            <div className="absolute top-10 right-10 text-6xl text-yellow-100 opacity-30 animate-pulse">
                🌙
            </div>
            {Array.from({ length: 40 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white rounded-full opacity-40 animate-pulse"
                    style={{
                        top: `${Math.random() * 60}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        animationDelay: `${Math.random() * 4}s`
                    }}
                />
            ))}
        </div>
    );
};

export default MoonEffect;
