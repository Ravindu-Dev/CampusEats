/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
                // Theme specific secondary colors
                christmas: {
                    red: '#D42426',
                    green: '#165B33',
                    gold: '#F8B229',
                },
                valentine: {
                    pink: '#ff4d6d',
                    red: '#c9184a',
                },
                halloween: {
                    orange: '#ff9a00',
                    purple: '#6e3cbc',
                },
                summer: {
                    yellow: '#f9d71c',
                    blue: '#1ca3ec',
                },
                monsoon: {
                    blue: '#4a90e2',
                    dark: '#2c3e50',
                }
            },
            animation: {
                'snow' : 'snow 10s linear infinite',
                'float': 'float 3s ease-in-out infinite',
                'rain': 'rain 0.5s linear infinite',
                'firework': 'firework 2s ease-out infinite',
            },
            keyframes: {
                snow: {
                    '0%': { transform: 'translateY(-10vh) translateX(0)' },
                    '100%': { transform: 'translateY(100vh) translateX(20px)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                rain: {
                    '0%': { transform: 'translateY(-10vh)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                firework: {
                    '0%': { transform: 'scale(0)', opacity: 1 },
                    '100%': { transform: 'scale(1.5)', opacity: 0 },
                }
            }
        },
    },
    plugins: [],
}
