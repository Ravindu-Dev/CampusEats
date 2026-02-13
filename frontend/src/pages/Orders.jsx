import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import orderService from '../services/orderService'
import Navbar from '../components/Navbar'

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const data = await orderService.getUserOrders()
            // Sort by most recent first
            const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setOrders(sortedOrders)
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'succeeded':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-2">View all your order history and details</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Orders List */}
                {!loading && !error && (
                    <>
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h2>
                                <p className="text-gray-600 mb-8 text-lg">Start exploring our menu and place your first order!</p>
                                <Link
                                    to="/menu"
                                    className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"
                                >
                                    Browse Menu
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                                        {/* Order Header */}
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm opacity-90">Order ID</p>
                                                    <p className="font-mono font-semibold text-lg">{order.id}</p>
                                                    <p className="text-sm opacity-90 mt-2">{formatDate(order.createdAt)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                        {order.paymentStatus?.toUpperCase() || 'PENDING'}
                                                    </span>
                                                    <p className="text-2xl font-bold mt-2">₹{order.totalAmount?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Food Items ({order.orderItems?.length || 0})
                                            </h3>
                                            <div className="space-y-4">
                                                {order.orderItems && order.orderItems.length > 0 ? (
                                                    order.orderItems.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                                                            {/* Item Image */}
                                                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                                                                {item.imageUrl ? (
                                                                    <img
                                                                        src={item.imageUrl}
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Item Details */}
                                                            <div className="flex-grow">
                                                                <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                                                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                    </svg>
                                                                    {item.canteenName}
                                                                </p>
                                                                <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                                            </div>

                                                            {/* Item Price */}
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold text-gray-900">₹{item.price?.toFixed(2)}</p>
                                                                <p className="text-sm text-gray-500">per item</p>
                                                                <p className="text-sm font-semibold text-blue-600 mt-1">
                                                                    Total: ₹{(item.price * item.quantity).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-center py-4">No items in this order</p>
                                                )}
                                            </div>

                                            {/* Pickup Details */}
                                            {(order.pickupDate || order.pickupTime) && (
                                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Pickup Details
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {order.pickupDate && (
                                                            <div>
                                                                <p className="text-sm text-gray-600">Date</p>
                                                                <p className="font-semibold text-gray-900">{order.pickupDate}</p>
                                                            </div>
                                                        )}
                                                        {order.pickupTime && (
                                                            <div>
                                                                <p className="text-sm text-gray-600">Time</p>
                                                                <p className="font-semibold text-gray-900">{order.pickupTime}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Track Order Button */}
                                            {order.orderStatus && order.orderStatus !== 'COMPLETED' && (
                                                <div className="mt-6">
                                                    <Link
                                                        to={`/orders/track/${order.id}`}
                                                        className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg text-center transform hover:scale-105"
                                                    >
                                                        📍 Track Order Status
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Orders
