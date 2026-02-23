import { useState } from 'react';
import PropTypes from 'prop-types';

function OrderTypeModal({ isOpen, onClose, onSelectOrderType }) {
    const [selectedType, setSelectedType] = useState(null);

    if (!isOpen) return null;

    const handleSelect = (type) => {
        setSelectedType(type);
        setTimeout(() => {
            onSelectOrderType(type);
            onClose();
            setSelectedType(null);
        }, 220);
    };

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
                style={{ animation: 'otmFadeIn 0.2s ease-out' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-2xl"
                    style={{ animation: 'otmScaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}
                >
                    {/* Glass card */}
                    <div className="relative bg-[#111]/95 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">

                        {/* Ambient glow top */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent rounded-full" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/30 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl mb-4 shadow-lg shadow-orange-900/40">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-black text-white mb-1 tracking-tight">When do you need your food?</h2>
                                <p className="text-gray-500 text-sm">Choose your preferred pickup option</p>
                            </div>

                            {/* Options */}
                            <div className="grid md:grid-cols-2 gap-4">

                                {/* Order Now */}
                                <button
                                    onClick={() => handleSelect('NOW')}
                                    className={`relative group p-6 rounded-2xl border transition-all duration-200 text-left ${
                                        selectedType === 'NOW'
                                            ? 'border-green-500/60 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.15)]'
                                            : 'border-white/[0.07] bg-white/[0.03] hover:border-green-500/30 hover:bg-green-500/[0.05]'
                                    }`}
                                >
                                    {/* Selected check */}
                                    {selectedType === 'NOW' && (
                                        <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                                            selectedType === 'NOW'
                                                ? 'bg-green-500 shadow-lg shadow-green-900/50'
                                                : 'bg-green-500/10 group-hover:bg-green-500/20'
                                        }`}>
                                            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-1">Order Now</h3>
                                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                            Get your food ready for immediate pickup
                                        </p>
                                        <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Ready ASAP
                                        </span>
                                    </div>
                                </button>

                                {/* Order Later */}
                                <button
                                    onClick={() => handleSelect('LATER')}
                                    className={`relative group p-6 rounded-2xl border transition-all duration-200 text-left ${
                                        selectedType === 'LATER'
                                            ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                                            : 'border-white/[0.07] bg-white/[0.03] hover:border-blue-500/30 hover:bg-blue-500/[0.05]'
                                    }`}
                                >
                                    {/* Selected check */}
                                    {selectedType === 'LATER' && (
                                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                                            selectedType === 'LATER'
                                                ? 'bg-blue-500 shadow-lg shadow-blue-900/50'
                                                : 'bg-blue-500/10 group-hover:bg-blue-500/20'
                                        }`}>
                                            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-1">Order Later</h3>
                                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                            Schedule your pickup for a specific time
                                        </p>
                                        <span className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-bold bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Choose Time
                                        </span>
                                    </div>
                                </button>
                            </div>

                            {/* Footer note */}
                            <p className="text-center text-xs text-white/20 mt-6">
                                💡 You can change pickup preferences before payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes otmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes otmScaleIn {
                    from { opacity: 0; transform: scale(0.92) translateY(12px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}

OrderTypeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelectOrderType: PropTypes.func.isRequired,
};

export default OrderTypeModal;
