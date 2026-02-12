import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentSuccessModal({ onClose }) {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setShow(true), 100);
    }, []);

    const handleContinueShopping = () => {
        setShow(false);
        setTimeout(() => {
            onClose();
            navigate('/menu');
        }, 300);
    };

    const handleViewOrders = () => {
        setShow(false);
        setTimeout(() => {
            onClose();
            navigate('/dashboard');
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={handleContinueShopping}
            ></div>

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    className={`bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                        }`}
                >
                    {/* Success Icon with Animation */}
                    <div className="flex justify-center mb-6">
                        <div className={`relative transform transition-all duration-500 ${show ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
                            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {/* Animated ring */}
                            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-green-400 animate-ping opacity-20"></div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
                        <p className="text-gray-600 text-lg mb-2">Your order has been placed successfully</p>
                        <p className="text-sm text-gray-500">
                            You will receive a confirmation email shortly
                        </p>
                    </div>

                    {/* Celebration Emojis */}
                    <div className="flex justify-center gap-4 text-4xl mb-8">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🎉</span>
                        <span className="animate-bounce" style={{ animationDelay: '100ms' }}>🍕</span>
                        <span className="animate-bounce" style={{ animationDelay: '200ms' }}>✨</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleViewOrders}
                            className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={handleContinueShopping}
                            className="w-full h-12 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Continue Shopping
                        </button>
                    </div>

                    {/* Secure Payment Badge */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Secured by Stripe</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccessModal;
