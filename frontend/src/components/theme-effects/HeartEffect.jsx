import React from 'react';

const HeartEffect = () => {
    const hearts = Array.from({ length: 30 });

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {hearts.map((_, i) => (
                <div
                    key={i}
                    className="absolute text-pink-500 opacity-60 animate-float"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        fontSize: `${15 + Math.random() * 25}px`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                    }}
                >
                    ♥
                </div>
            ))}
        </div>
    );
};

export default HeartEffect;
