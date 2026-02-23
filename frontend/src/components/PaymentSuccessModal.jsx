import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import QRCodeDisplay from './QRCodeDisplay';

function PaymentSuccessModal({ onClose, orders = [] }) {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [currentQRIndex, setCurrentQRIndex] = useState(0);

    useEffect(() => {
        setTimeout(() => setShow(true), 80);
    }, []);

    const handleContinueShopping = () => {
        setShow(false);
        setTimeout(() => { onClose(); navigate('/menu'); }, 300);
    };

    const handleViewOrders = () => {
        setShow(false);
        setTimeout(() => { onClose(); navigate('/dashboard'); }, 300);
    };

    const nextQR = () => setCurrentQRIndex((prev) => (prev + 1) % orders.length);
    const prevQR = () => setCurrentQRIndex((prev) => (prev - 1 + orders.length) % orders.length);

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Scrollable container — prevents top/bottom clipping on short viewports */}
            <div className="absolute inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div
                        className={`relative w-full max-w-xl my-6 transform transition-all duration-300 ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'}`}
                    >
                        {/* Glass card */}
                        <div className="bg-[#111]/95 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">

                            {/* Top ambient glow line */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-green-500/60 to-transparent rounded-full" />

                            <div className="p-8">
                                {/* Success icon */}
                                <div className="flex justify-center mb-6">
                                    <div className={`relative transition-all duration-500 ${show ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}>
                                        <div className="absolute -inset-3 rounded-full bg-green-500/10 animate-pulse" />
                                        <div className="absolute -inset-1 rounded-full border-2 border-green-500/20 animate-ping" />
                                        <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-900/50">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Success message */}
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Payment Successful!</h2>
                                    <p className="text-gray-400 text-sm">Your order has been placed successfully</p>
                                    <p className="text-gray-600 text-xs mt-1">You will receive a confirmation email shortly</p>
                                </div>

                                {/* QR Code section */}
                                {orders.length > 0 && orders[0].qrCodeBase64 && (
                                    <div className="mb-6 bg-white/[0.04] border border-orange-500/20 rounded-2xl p-5">
                                        {/* Screenshot reminder */}
                                        <div className="mb-5 text-center">
                                            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-5 py-2.5 rounded-xl font-bold text-sm">
                                                <span className="text-xl">📸</span>
                                                <span>Save or screenshot your QR code!</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">Show this QR code when picking up your order</p>
                                        </div>

                                        {orders.length === 1 ? (
                                            <QRCodeDisplay
                                                qrCodeBase64={orders[0].qrCodeBase64}
                                                orderId={orders[0].id}
                                                size={220}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <p className="text-white/60 text-sm font-bold">Order {currentQRIndex + 1} of {orders.length}</p>
                                                    <p className="text-xs text-gray-600">{orders[currentQRIndex].orderItems?.[0]?.canteenName}</p>
                                                </div>

                                                <QRCodeDisplay
                                                    qrCodeBase64={orders[currentQRIndex].qrCodeBase64}
                                                    orderId={orders[currentQRIndex].id}
                                                    size={220}
                                                />

                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={prevQR}
                                                        className="px-5 py-2 bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.1] rounded-xl text-sm font-semibold transition-all"
                                                    >
                                                        ← Previous
                                                    </button>
                                                    <button
                                                        onClick={nextQR}
                                                        className="px-5 py-2 bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.1] rounded-xl text-sm font-semibold transition-all"
                                                    >
                                                        Next →
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Celebration */}
                                <div className="flex justify-center gap-4 text-3xl mb-6">
                                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🎉</span>
                                    <span className="animate-bounce" style={{ animationDelay: '120ms' }}>🍕</span>
                                    <span className="animate-bounce" style={{ animationDelay: '240ms' }}>✨</span>
                                </div>

                                {/* Action buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleViewOrders}
                                        className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-900/40 hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        View My Orders
                                    </button>
                                    <button
                                        onClick={handleContinueShopping}
                                        className="w-full h-12 bg-white/[0.05] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08] rounded-2xl font-bold text-sm transition-all"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>

                                {/* Secure badge */}
                                <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-2 text-xs text-white/20">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Secured by Stripe
                                </div>
                            </div>
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
