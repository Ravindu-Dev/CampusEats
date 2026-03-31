import React from 'react';

const SinhalaTamilNewYearEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute text-3xl opacity-30 animate-snow"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 8}s`,
                        animationDuration: `${6 + Math.random() * 4}s`,
                        fontSize: `${20 + Math.random() * 20}px`
                    }}
                >
                    {['🍩', '🍪', '🥘', '🪔'][i % 4]}
                </div>
            ))}
        </div>
    );
};

export default SinhalaTamilNewYearEffect;
