import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import QRCodeDisplay from './QRCodeDisplay';

function PaymentSuccessModal({ onClose, orders = [] }) {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [currentQRIndex, setCurrentQRIndex] = useState(0);

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

    const nextQR = () => {
        setCurrentQRIndex((prev) => (prev + 1) % orders.length);
    };

    const prevQR = () => {
        setCurrentQRIndex((prev) => (prev - 1 + orders.length) % orders.length);
    };

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'
                    }`}
            ></div>

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <div
                    className={`bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 my-8 transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
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
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
                        <p className="text-gray-600 text-lg mb-2">Your order has been placed successfully</p>
                        <p className="text-sm text-gray-500">
                            You will receive a confirmation email shortly
                        </p>
                    </div>

                    {/* QR Code Section */}
                    {orders.length > 0 && orders[0].qrCodeBase64 && (
                        <div className="mb-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
                            {/* Screenshot Reminder */}
                            <div className="mb-6 text-center">
                                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-6 py-3 rounded-xl font-bold text-lg shadow-md">
                                    <span className="text-2xl">📸</span>
                                    <span>Take a screenshot or save this QR code!</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">You'll need to show this QR code when picking up your order</p>
                            </div>

                            {/* QR Code Display */}
                            {orders.length === 1 ? (
                                <QRCodeDisplay
                                    qrCodeBase64={orders[0].qrCodeBase64}
                                    orderId={orders[0].id}
                                    size={250}
                                />
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-700">
                                            Order {currentQRIndex + 1} of {orders.length}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {orders[currentQRIndex].orderItems[0]?.canteenName}
                                        </p>
                                    </div>

                                    <QRCodeDisplay
                                        qrCodeBase64={orders[currentQRIndex].qrCodeBase64}
                                        orderId={orders[currentQRIndex].id}
                                        size={250}
                                    />

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={prevQR}
                                            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                                        >
                                            ← Previous
                                        </button>
                                        <button
                                            onClick={nextQR}
                                            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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

PaymentSuccessModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    orders: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        qrCodeBase64: PropTypes.string,
        orderItems: PropTypes.array
    }))
};

export default PaymentSuccessModal;
