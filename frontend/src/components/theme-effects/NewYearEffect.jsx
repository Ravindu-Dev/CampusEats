import React from 'react';

const NewYearEffect = () => {
    const firecrackers = Array.from({ length: 15 });

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {firecrackers.map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full animate-firework"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: '4px',
                        height: '4px',
                        backgroundColor: ['#ff0', '#f0f', '#0ff', '#f00', '#0f0'][i % 5],
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
        </div>
    );
};

export default NewYearEffect;
