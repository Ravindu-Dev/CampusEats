import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import canteenAuthService from '../services/canteenAuthService';
import orderService from '../services/orderService';

function KitchenDashboard() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canteenOwner, setCanteenOwner] = useState(null);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [newOrdersCount, setNewOrdersCount] = useState(0);

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

                        // Play notification sound (optional)
                        try {
                            const audio = new Audio('/notification.mp3');
                            audio.play().catch(() => { });
                        } catch (e) { }

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

        // Set up polling every 10 seconds
        const pollInterval = setInterval(() => {
            fetchOrders(false);
        }, 10000);

        // Cleanup interval on unmount
        return () => clearInterval(pollInterval);
    }, [navigate, orders.length]);

    // Filter orders when activeFilter or orders change
    useEffect(() => {
        // Only show orders with successful payment
        const paidOrders = orders.filter(order => order.paymentStatus === 'succeeded');

        if (activeFilter === 'ALL') {
            setFilteredOrders(paidOrders);
        } else {
            setFilteredOrders(paidOrders.filter(order => order.orderStatus === activeFilter));
        }
    }, [activeFilter, orders]);

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

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus, canteenOwner.canteenId);

            // Refresh orders immediately
            const data = await orderService.getCanteenOrders(canteenOwner.canteenId);
            setOrders(data);
        } catch (error) {
            console.error('Error updating order status:', error);

            // Show specific error message
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status';

            if (errorMessage.includes('Payment not completed')) {
                alert('⚠️ Cannot update order status: Payment has not been completed yet.');
            } else {
                alert(`Failed to update order status: ${errorMessage}`);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'PREPARING': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'READY': return 'bg-green-100 text-green-800 border-green-300';
            case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'PREPARING':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                );
            case 'READY':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'COMPLETED':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            default:
                return null;
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

    const getOrderCounts = () => {
        // Only count paid orders
        const paidOrders = orders.filter(o => o.paymentStatus === 'succeeded');
        return {
            ALL: paidOrders.length,
            PENDING: paidOrders.filter(o => o.orderStatus === 'PENDING').length,
            PREPARING: paidOrders.filter(o => o.orderStatus === 'PREPARING').length,
            READY: paidOrders.filter(o => o.orderStatus === 'READY').length,
            COMPLETED: paidOrders.filter(o => o.orderStatus === 'COMPLETED').length,
        };
    };

    const counts = getOrderCounts();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            {/* Header */}
            <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-10 border-b border-orange-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/canteen/dashboard')}
                                className="text-gray-600 hover:text-orange-600 transition transform hover:scale-110"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    🍳 Kitchen Dashboard
                                </h1>
                                <p className="text-xs text-gray-500">Last updated: {getTimeSinceUpdate()}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                {/* New Orders Notification */}
                {newOrdersCount > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg animate-pulse">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-green-800 font-semibold text-lg">
                                🎉 {newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''} received!
                            </p>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="mb-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-2 border border-orange-100">
                    <div className="flex flex-wrap gap-2">
                        {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${activeFilter === filter
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span>{filter.charAt(0) + filter.slice(1).toLowerCase()}</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${activeFilter === filter ? 'bg-white/30' : 'bg-gray-300'
                                    }`}>
                                    {counts[filter]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
                        <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeFilter.toLowerCase()} orders</h3>
                        <p className="text-gray-600">Orders will appear here when customers place them.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02]">
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Order #{order.id.slice(-6).toUpperCase()}
                                                </h3>
                                                <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.orderStatus)}`}>
                                                    {getStatusIcon(order.orderStatus)}
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Placed {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="mt-4 md:mt-0 text-right">
                                            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                                ₹{order.totalAmount.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-600">Total Amount</p>
                                        </div>
                                    </div>

                                    {/* Customer & Pickup Info */}
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Customer
                                            </h4>
                                            <p className="font-semibold text-gray-900 mb-1">{order.customerName}</p>
                                            <p className="text-sm text-gray-600">{order.customerPhone}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Pickup Time
                                            </h4>
                                            <p className="font-bold text-orange-800 text-lg">
                                                {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Items</h4>
                                        <div className="space-y-2">
                                            {order.orderItems.map((item, index) => (
                                                <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                                                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 border-2 border-white shadow">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-2xl">🍱</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900">{item.name}</p>
                                                        <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                            disabled={order.orderStatus !== 'PENDING'}
                                            className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${order.orderStatus === 'PENDING'
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            🔥 Start Preparing
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'READY')}
                                            disabled={order.orderStatus !== 'PREPARING'}
                                            className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${order.orderStatus === 'PREPARING'
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            ✅ Mark Ready
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                            disabled={order.orderStatus !== 'READY'}
                                            className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${order.orderStatus === 'READY'
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            🎉 Complete
                                        </button>
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

export default KitchenDashboard;
