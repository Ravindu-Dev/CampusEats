import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Check, Loader2 } from 'lucide-react';

const themes = [
    { id: 'default', name: 'Default Theme', icon: '🎨', description: 'Standard CampusEats experience' },
    { id: 'dark', name: 'Dark Mode', icon: '🌙', description: 'Easy on the eyes for night time' },
    { id: 'christmas', name: 'Christmas', icon: '❄️', description: 'Festive snow and holiday spirit' },
    { id: 'valentine', name: 'Valentine\'s', icon: '❤️', description: 'Love and floating hearts' },
    { id: 'halloween', name: 'Halloween', icon: '🎃', description: 'Spooky ghosts and pumpkins' },
    { id: 'ramadan', name: 'Ramadan/Eid', icon: '🌙', description: 'Crescent moon and stars' },
    { id: 'new-year', name: 'New Year', icon: '🎆', description: 'Celebration and fireworks' },
    { id: 'summer', name: 'Summer', icon: '☀️', description: 'Bright sun and warm vibes' },
    { id: 'monsoon', name: 'Monsoon', icon: '🌧️', description: 'Rainy days and cozy tones' },
    { id: 'sinhala-tamil-new-year', name: 'Sinhala & Tamil NY', icon: '🍩', description: 'Traditional sweets and festivities' },
];

const AdminThemeControl = () => {
    const { currentTheme, updateGlobalTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(currentTheme);
    const [success, setSuccess] = useState(false);

    const handleApply = async () => {
        setLoading(true);
        setSuccess(false);
        try {
            await updateGlobalTheme(selectedTheme);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Theme update error:', error);
            const msg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to update theme: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#050505] rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-3xl">
            <div className="flex items-center gap-6 mb-10">
                <div className="p-4 bg-primary-600/20 rounded-2xl text-primary-500 border border-primary-500/20">
                    <Palette size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Global Theme System</h2>
                    <p className="text-gray-400 mt-1">Deploy seasonal visuals across the entire platform</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                            selectedTheme === theme.id
                                ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(255,140,0,0.15)] scale-[1.02]'
                                : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">{theme.icon}</span>
                            {selectedTheme === theme.id && (
                                <div className="bg-primary-500 text-white p-1 rounded-full shadow-lg shadow-primary-500/40">
                                    <Check size={16} />
                                </div>
                            )}
                        </div>
                        <h3 className={`font-bold text-lg ${selectedTheme === theme.id ? 'text-primary-500' : 'text-white'}`}>
                            {theme.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                            {theme.description}
                        </p>
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <div className="flex items-center gap-2">
                    {success && (
                        <div className="flex items-center gap-2 text-green-400 font-medium px-4 py-2 bg-green-400/10 rounded-full border border-green-400/20 animate-in fade-in slide-in-from-left-4">
                            <span>✨</span> Theme applied successfully!
                        </div>
                    )}
                </div>
                
                <button
                    onClick={handleApply}
                    disabled={loading || selectedTheme === currentTheme}
                    className={`flex items-center gap-3 px-10 py-4 rounded-xl font-bold transition-all duration-300 ${
                        loading || selectedTheme === currentTheme
                            ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                            : 'bg-primary-600 hover:bg-primary-500 text-white shadow-[0_10px_25px_-5px_rgba(255,140,0,0.4)] hover:-translate-y-1 active:translate-y-0'
                    }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Updating System...</span>
                        </>
                    ) : (
                        <>
                            <Palette size={20} />
                            <span>Deploy Theme Globally</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdminThemeControl;
