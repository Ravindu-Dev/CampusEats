import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import canteenService from '../services/canteenService';
import canteenAuthService from '../services/canteenAuthService';
import orderService from '../services/orderService';
import CanteenLayout from '../components/CanteenLayout';

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

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return { bg: 'rgba(234,179,8,0.1)', text: '#facc15', border: 'rgba(234,179,8,0.2)' };
            case 'succeeded': return { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' };
            case 'failed': return { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)' };
            default: return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)' };
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
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <CanteenLayout pageTitle="Incoming Orders" pageSubtitle={`Last updated: ${getTimeSinceUpdate()}`}>

            <div className="flex justify-end mb-6">
                <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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

            {/* Success Message */}
            {successMessage && (
                <div style={{ background: 'rgba(34,197,94,0.1)', borderLeft: '4px solid #22c55e', color: '#4ade80' }} className="mb-6 p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-semibold">
                                ✅ {successMessage}
                            </p>
                        </div>
                        <button
                            onClick={() => setSuccessMessage('')}
                            className="hover:text-white"
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
                <div style={{ background: 'rgba(59,130,246,0.1)', borderLeft: '4px solid #3b82f6', color: '#60a5fa' }} className="mb-6 p-4 rounded-lg shadow-sm animate-pulse">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="font-semibold">
                            🎉 {newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''} received!
                        </p>
                    </div>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <div style={{ background: 'rgba(255,255,255,0.02)' }} className="rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 border border-gray-800">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-200">No orders yet</h3>
                    <p className="mt-1 text-gray-500">Orders will appear here when customers verify them.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const style = getStatusStyles(order.paymentStatus);
                        return (
                            <div
                                key={order.id}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: highlightOrderId === order.id ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.05)',
                                    ...(highlightOrderId === order.id ? { boxShadow: '0 0 15px rgba(34,197,94,0.3)' } : {})
                                }}
                                className="rounded-xl overflow-hidden hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="text-lg font-bold text-white">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                                <span style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }} className="px-3 py-1 rounded-full text-xs font-semibold border">
                                                    {order.paymentStatus.toUpperCase()}
                                                </span>
                                                {/* Order Type Badge */}
                                                <span style={order.orderType === 'NOW' ? {
                                                    background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)'
                                                } : {
                                                    background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'
                                                }} className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {order.orderType === 'NOW' ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        )}
                                                    </svg>
                                                    {order.orderType === 'NOW' ? 'ORDER NOW' : 'ORDER LATER'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                {order.orderType === 'NOW' ? (
                                                    <>Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</>
                                                ) : (
                                                    <>Pickup: {order.pickupDate} at {order.pickupTime}</>
                                                )}
                                            </p>
                                        </div>
                                        <div className="mt-4 md:mt-0 text-right">
                                            <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Rs.{order.totalAmount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-[rgba(255,255,255,0.05)] pt-6 grid md:grid-cols-2 gap-8">
                                        {/* Customer Details */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Customer Details</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center text-gray-400">
                                                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {order.customerName}
                                                </div>
                                                <div className="flex items-center text-gray-400">
                                                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {order.customerEmail}
                                                </div>
                                                <div className="flex items-center text-gray-400">
                                                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {order.customerPhone}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Pickup Time</h4>
                                                <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }} className="rounded-lg p-3 inline-block">
                                                    <span className="font-medium text-orange-400">
                                                        {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Items Ordered</h4>
                                            <div className="space-y-3">
                                                {order.orderItems.map((item, index) => (
                                                    <div key={index} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }} className="flex items-center gap-4 p-2 rounded-xl">
                                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[rgba(255,255,255,0.05)]">
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-xl">🍱</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <p className="font-medium text-gray-200">{item.name}</p>
                                                                <p className="font-medium text-gray-200">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                                            </div>
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity} × Rs.{item.price}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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

export default CanteenOrders;
