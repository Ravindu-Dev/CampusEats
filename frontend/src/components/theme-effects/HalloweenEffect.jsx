import React from 'react';

const HalloweenEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute text-3xl opacity-20 animate-bounce"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 3}s`
                    }}
                >
                    {['🎃', '👻', '🦇'][i % 3]}
                </div>
            ))}
        </div>
    );
};

export default HalloweenEffect;
