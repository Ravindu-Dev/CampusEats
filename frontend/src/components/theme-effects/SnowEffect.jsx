import React from 'react';

const SnowEffect = () => {
    const snowflakes = Array.from({ length: 50 });

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {snowflakes.map((_, i) => (
                <div
                    key={i}
                    className="absolute text-white opacity-80 animate-snow"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${5 + Math.random() * 5}s`,
                        fontSize: `${10 + Math.random() * 20}px`
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    );
};

export default SnowEffect;
