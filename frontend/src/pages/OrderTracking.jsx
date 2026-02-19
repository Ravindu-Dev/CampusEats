import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import Navbar from '../components/Navbar';

function OrderTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const data = await orderService.getOrderStatus(orderId);

                // Show confetti when order becomes ready (only once)
                if (data.orderStatus === 'READY' && order?.orderStatus !== 'READY') {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                }

                setOrder(data);
                setError('');
            } catch (err) {
                console.error('Error fetching order status:', err);
                setError('Failed to load order status');
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchOrderStatus();

        // Poll every 5 seconds for real-time updates
        const pollInterval = setInterval(fetchOrderStatus, 5000);

        // Cleanup on unmount
        return () => clearInterval(pollInterval);
    }, [orderId, order?.orderStatus]);

    const getStepStatus = (stepStatus) => {
        if (!order) return 'upcoming';

        const statusOrder = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];
        const currentIndex = statusOrder.indexOf(order.orderStatus);
        const stepIndex = statusOrder.indexOf(stepStatus);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    const getStepIcon = (status, stepStatus) => {
        if (status === 'completed') {
            return (
                <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            );
        }

        if (status === 'current') {
            return (
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white shadow-lg animate-pulse">
                    {stepStatus === 'PENDING' && '⏳'}
                    {stepStatus === 'PREPARING' && '🔥'}
                    {stepStatus === 'READY' && '✅'}
                    {stepStatus === 'COMPLETED' && '🎉'}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center w-12 h-12 bg-gray-300 rounded-full text-gray-600">
                {stepStatus === 'PENDING' && '⏳'}
                {stepStatus === 'PREPARING' && '🔥'}
                {stepStatus === 'READY' && '✅'}
                {stepStatus === 'COMPLETED' && '🎉'}
            </div>
        );
    };

    const getStepTitle = (stepStatus) => {
        switch (stepStatus) {
            case 'PENDING': return 'Order Received';
            case 'PREPARING': return 'Preparing Your Food';
            case 'READY': return 'Ready for Pickup';
            case 'COMPLETED': return 'Order Completed';
            default: return '';
        }
    };

    const getStepDescription = (stepStatus) => {
        switch (stepStatus) {
            case 'PENDING': return 'Your order has been received and is waiting to be prepared';
            case 'PREPARING': return 'The kitchen is preparing your delicious meal';
            case 'READY': return 'Your order is ready! Please pick it up';
            case 'COMPLETED': return 'Thank you for your order! Enjoy your meal';
            default: return '';
        }
    };

    const getTimestamp = (stepStatus) => {
        if (!order) return null;

        switch (stepStatus) {
            case 'PENDING': return order.createdAt;
            case 'PREPARING': return order.preparedAt;
            case 'READY': return order.readyAt;
            case 'COMPLETED': return order.completedAt;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <Navbar />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                        {error || 'Order not found'}
                    </div>
                    <Link to="/orders" className="inline-block mt-4 text-blue-600 hover:text-blue-800">
                        ← Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navbar />

            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        >
                            {['🎉', '✨', '🎊', '⭐', '💫'][Math.floor(Math.random() * 5)]}
                        </div>
                    ))}
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Orders
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900">Track Your Order</h1>
                    <p className="text-gray-600 mt-2">Order #{order.id.slice(-6).toUpperCase()}</p>
                </div>

                {/* Ready Alert */}
                {order.orderStatus === 'READY' && (
                    <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-6 shadow-xl animate-bounce">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-green-800">🎉 Your Order is Ready!</h3>
                                <p className="text-green-700 mt-1">Please pick up your order at the canteen</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Progress */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Progress</h2>

                    <div className="space-y-8">
                        {['PENDING', 'PREPARING', 'READY', 'COMPLETED'].map((stepStatus, index) => {
                            const status = getStepStatus(stepStatus);
                            const timestamp = getTimestamp(stepStatus);

                            return (
                                <div key={stepStatus} className="relative">
                                    {/* Connecting Line */}
                                    {index < 3 && (
                                        <div className={`absolute left-6 top-12 w-0.5 h-16 ${status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                            }`} />
                                    )}

                                    <div className="flex items-start gap-6">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            {getStepIcon(status, stepStatus)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pt-1">
                                            <h3 className={`text-xl font-bold mb-1 ${status === 'current' ? 'text-blue-600' :
                                                    status === 'completed' ? 'text-green-600' :
                                                        'text-gray-400'
                                                }`}>
                                                {getStepTitle(stepStatus)}
                                            </h3>
                                            <p className={`text-sm mb-2 ${status === 'upcoming' ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                {getStepDescription(stepStatus)}
                                            </p>
                                            {timestamp && (
                                                <p className="text-xs text-gray-500">
                                                    {new Date(timestamp).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>

                    {/* Pickup Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Pickup Time
                        </h3>
                        <p className="font-bold text-blue-800 text-lg">
                            {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
                        </p>
                    </div>

                    {/* Items */}
                    <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                    <div className="space-y-3 mb-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-2xl">🍱</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-gray-900">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Rs.{order.totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti linear forwards;
                    font-size: 2rem;
                }
            `}</style>
        </div>
    );
}

export default OrderTracking;
