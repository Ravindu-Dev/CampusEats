import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import canteenService from '../services/canteenService';
import canteenAuthService from '../services/canteenAuthService';
import orderService from '../services/orderService';

function CanteenOrders() {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canteenOwner, setCanteenOwner] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [newOrdersCount, setNewOrdersCount] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
    const [highlightOrderId, setHighlightOrderId] = useState(location.state?.highlightOrderId || null);

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner();
        if (!owner) {
            navigate('/canteen/login');
            return;
        }
        setCanteenOwner(owner);

        const fetchOrders = async (showRefreshIndicator = false) => {
            try {
                if (showRefreshIndicator) {
                    setIsRefreshing(true);
                }

                if (owner.canteenId) {
                    const data = await orderService.getCanteenOrders(owner.canteenId);

                    // Check for new orders
                    if (orders.length > 0 && data.length > orders.length) {
                        const newCount = data.length - orders.length;
                        setNewOrdersCount(newCount);

                        // Clear notification after 5 seconds
                        setTimeout(() => setNewOrdersCount(0), 5000);
                    }

                    setOrders(data);
                    setLastUpdated(new Date());
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
                setIsRefreshing(false);
            }
        };

        // Initial fetch
        fetchOrders();

        // Set up polling every 30 seconds
        const pollInterval = setInterval(() => {
            fetchOrders(false);
        }, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(pollInterval);
    }, [navigate, orders.length]);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            if (canteenOwner?.canteenId) {
                const data = await orderService.getCanteenOrders(canteenOwner.canteenId);
                setOrders(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error refreshing orders:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'succeeded': return 'bg-green-100 text-green-800 border-green-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTimeSinceUpdate = () => {
        const seconds = Math.floor((new Date() - lastUpdated) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/canteen/dashboard')}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Incoming Orders</h1>
                                <p className="text-xs text-gray-500">Last updated: {getTimeSinceUpdate()}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg
                                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-800 font-semibold">
                                    ✅ {successMessage}
                                </p>
                            </div>
                            <button
                                onClick={() => setSuccessMessage('')}
                                className="text-green-600 hover:text-green-800"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* New Orders Notification */}
                {newOrdersCount > 0 && (
                    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm animate-pulse">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-blue-800 font-semibold">
                                🎉 {newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''} received!
                            </p>
                        </div>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                        <p className="mt-1 text-gray-500">Orders will appear here when customers verify them.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition ${highlightOrderId === order.id
                                        ? 'border-4 border-green-500 ring-4 ring-green-200'
                                        : 'border border-gray-100'
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="mt-4 md:mt-0 text-right">
                                            <p className="text-2xl font-bold text-orange-600">₹{order.totalAmount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6 grid md:grid-cols-2 gap-8">
                                        {/* Customer Details */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Customer Details</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {order.customerName}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {order.customerEmail}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {order.customerPhone}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Pickup Time</h4>
                                                <div className="bg-orange-50 rounded-lg p-3 inline-block">
                                                    <span className="font-medium text-orange-800">
                                                        {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Items Ordered</h4>
                                            <div className="space-y-3">
                                                {order.orderItems.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-4">
                                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-xl">🍱</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                                <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                            </div>
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default CanteenOrders;
