import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import canteenAuthService from '../services/canteenAuthService';
import orderService from '../services/orderService';
import CanteenLayout from '../components/CanteenLayout';

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

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDING': return { bg: 'rgba(234,179,8,0.1)', text: '#facc15', border: 'rgba(234,179,8,0.3)' };
            case 'PREPARING': return { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' };
            case 'READY': return { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' };
            case 'COMPLETED': return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.3)' };
            default: return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.3)' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'PREPARING':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                );
            case 'READY':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'COMPLETED':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <CanteenLayout pageTitle="Kitchen Dashboard" pageSubtitle={`Manage order preparation & status. Last updated: ${getTimeSinceUpdate()}`}>

            <div className="flex justify-end mb-6">
                <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.05)] text-gray-300 border border-[rgba(255,255,255,0.1)] rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    <svg
                        className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* New Orders Notification */}
            {newOrdersCount > 0 && (
                <div style={{ background: 'rgba(34,197,94,0.1)', borderLeft: '4px solid #22c55e', color: '#4ade80' }} className="mb-6 p-4 rounded-lg shadow-sm animate-pulse">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="font-semibold text-lg">
                            🎉 {newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''} received!
                        </p>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="mb-6 rounded-2xl shadow-xl p-2">
                <div className="flex flex-wrap gap-2">
                    {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            style={{
                                background: activeFilter === filter ? 'linear-gradient(to right, #ea580c, #dc2626)' : 'transparent',
                                color: activeFilter === filter ? 'white' : 'rgba(255,255,255,0.6)',
                            }}
                            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition-all hover:text-white hover:bg-[rgba(255,255,255,0.05)]`}
                        >
                            <span>{filter.charAt(0) + filter.slice(1).toLowerCase()}</span>
                            <span style={{ background: activeFilter === filter ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }} className="ml-2 px-2 py-1 rounded-full text-xs font-bold text-white">
                                {counts[filter]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="text-center py-16 rounded-2xl shadow-lg">
                    <div className="bg-[rgba(255,255,255,0.05)] rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 border border-[rgba(255,255,255,0.05)]">
                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-200 mb-2">No {activeFilter.toLowerCase()} orders</h3>
                    <p className="text-gray-500">Orders will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => {
                        const statusStyle = getStatusStyles(order.orderStatus);
                        return (
                            <div key={order.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.05)]">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="text-xl font-bold text-white">
                                                    Order #{order.id.slice(-6).toUpperCase()}
                                                </h3>
                                                <span style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border`}>
                                                    {getStatusIcon(order.orderStatus)}
                                                    {order.orderStatus}
                                                </span>
                                                {/* Order Type Badge */}
                                                <span style={order.orderType === 'NOW' ? {
                                                    background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)'
                                                } : {
                                                    background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'
                                                }} className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border`}>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {order.orderType === 'NOW' ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        )}
                                                    </svg>
                                                    {order.orderType === 'NOW' ? (
                                                        <span className="flex items-center gap-1">
                                                            ORDER NOW
                                                            <span className="inline-block w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse"></span>
                                                        </span>
                                                    ) : (
                                                        'ORDER LATER'
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {order.orderType === 'NOW' ? (
                                                    <>Placed {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</>
                                                ) : (
                                                    <>Scheduled for: {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}</>
                                                )}
                                            </p>
                                        </div>
                                        <div className="mt-4 md:mt-0 text-right">
                                            <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                                Rs.{order.totalAmount.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                        </div>
                                    </div>

                                    {/* Customer & Pickup Info */}
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }} className="rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Customer
                                            </h4>
                                            <p className="font-semibold text-gray-200 mb-1">{order.customerName}</p>
                                            <p className="text-sm text-gray-500">{order.customerPhone}</p>
                                        </div>
                                        <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)' }} className="rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-[#fb923c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Pickup Time
                                            </h4>
                                            <p className="font-bold text-[#fdba74] text-lg">
                                                {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Items</h4>
                                        <div className="space-y-2">
                                            {order.orderItems.map((item, index) => (
                                                <div key={index} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="flex items-center gap-4 rounded-lg p-3">
                                                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-2xl">🍱</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-200">{item.name}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity} × Rs.{item.price}</p>
                                                    </div>
                                                    <p className="font-bold text-gray-200">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                            disabled={order.orderStatus !== 'PENDING'}
                                            style={order.orderStatus === 'PENDING' ? {
                                                background: 'linear-gradient(to right, #3b82f6, #4f46e5)', color: 'white', border: 'none'
                                            } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.1)' }}
                                            className={`flex-1 min-w-[150px] px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg`}
                                        >
                                            🔥 Start Preparing
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'READY')}
                                            disabled={order.orderStatus !== 'PREPARING'}
                                            style={order.orderStatus === 'PREPARING' ? {
                                                background: 'linear-gradient(to right, #16a34a, #059669)', color: 'white', border: 'none'
                                            } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.1)' }}
                                            className={`flex-1 min-w-[150px] px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg`}
                                        >
                                            ✅ Mark Ready
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                            disabled={order.orderStatus !== 'READY'}
                                            style={order.orderStatus === 'READY' ? {
                                                background: 'linear-gradient(to right, #9333ea, #db2777)', color: 'white', border: 'none'
                                            } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.1)' }}
                                            className={`flex-1 min-w-[150px] px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg`}
                                        >
                                            🎉 Complete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </CanteenLayout>
    );
}

export default KitchenDashboard;
