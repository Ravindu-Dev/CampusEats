import React from 'react';

const RainEffect = () => {
    const drops = Array.from({ length: 100 });

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {drops.map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-blue-400 opacity-50 h-4 w-px animate-rain"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 10}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }}
                />
            ))}
        </div>
    );
};

export default RainEffect;
