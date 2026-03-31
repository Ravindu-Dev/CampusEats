import React from 'react';

const SummerEffect = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] rounded-full bg-yellow-400/20 blur-[100px] animate-pulse" />
            {Array.from({ length: 10 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute text-4xl opacity-10 animate-float"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                >
                    ☀️
                </div>
            ))}
        </div>
    );
};

export default SummerEffect;
