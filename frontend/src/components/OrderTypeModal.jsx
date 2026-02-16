import { useState } from 'react';
import PropTypes from 'prop-types';

function OrderTypeModal({ isOpen, onClose, onSelectOrderType }) {
    const [selectedType, setSelectedType] = useState(null);

    if (!isOpen) return null;

    const handleSelect = (type) => {
        setSelectedType(type);
        // Add a small delay for visual feedback before closing
        setTimeout(() => {
            onSelectOrderType(type);
            onClose();
            setSelectedType(null);
        }, 200);
    };

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 transform transition-all animate-scaleIn">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl mb-4">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">When do you need your food?</h2>
                        <p className="text-gray-600">Choose your preferred pickup option</p>
                    </div>

                    {/* Options */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Order Now */}
                        <button
                            onClick={() => handleSelect('NOW')}
                            className={`relative group p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${selectedType === 'NOW'
                                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedType === 'NOW'
                                        ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-200'
                                        : 'bg-gradient-to-br from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200'
                                    }`}>
                                    <svg className={`w-8 h-8 ${selectedType === 'NOW' ? 'text-white' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Order Now</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Get your food ready for immediate pickup
                                </p>
                                <div className="flex items-center gap-2 text-green-600 font-semibold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Ready ASAP</span>
                                </div>
                            </div>
                            {selectedType === 'NOW' && (
                                <div className="absolute top-3 right-3">
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>

                        {/* Order Later */}
                        <button
                            onClick={() => handleSelect('LATER')}
                            className={`relative group p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${selectedType === 'LATER'
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedType === 'LATER'
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200'
                                        : 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200'
                                    }`}>
                                    <svg className={`w-8 h-8 ${selectedType === 'LATER' ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Order Later</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Schedule your pickup for a specific time
                                </p>
                                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Choose Time</span>
                                </div>
                            </div>
                            {selectedType === 'LATER' && (
                                <div className="absolute top-3 right-3">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            💡 You can change your pickup preferences before payment
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
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
