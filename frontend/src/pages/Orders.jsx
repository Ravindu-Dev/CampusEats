import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import orderService from '../services/orderService'
import Navbar from '../components/Navbar'
import ReviewModal from '../components/ReviewModal'
import QRCodeDisplay from '../components/QRCodeDisplay'

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)

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

    const handleOpenReviewModal = (order) => {
        setSelectedOrder(order)
        setReviewModalOpen(true)
    }

    const handleCloseReviewModal = () => {
        setReviewModalOpen(false)
        setSelectedOrder(null)
    }

    const handleReviewSubmitted = () => {
        // Refresh orders to update hasReview status
        fetchOrders()
    }

    const canReview = (order) => {
        return (
            order.orderStatus === 'COMPLETED' &&
            order.paymentStatus?.toLowerCase() === 'succeeded' &&
            !order.hasReview
        )
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
                                                    <p className="text-2xl font-bold mt-2">Rs.{order.totalAmount?.toFixed(2)}</p>
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
                                                                <p className="text-lg font-bold text-gray-900">Rs.{item.price?.toFixed(2)}</p>
                                                                <p className="text-sm text-gray-500">per item</p>
                                                                <p className="text-sm font-semibold text-blue-600 mt-1">
                                                                    Total: Rs.{(item.price * item.quantity).toFixed(2)}
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

                                            {/* QR Code for Pickup */}
                                            {order.paymentStatus?.toLowerCase() === 'succeeded' && order.qrCodeBase64 && (
                                                <div className="mt-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                                                        <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                        </svg>
                                                        Your Pickup QR Code
                                                    </h4>
                                                    <div className="bg-white rounded-lg p-4 mb-3">
                                                        <p className="text-sm text-gray-600 mb-4 text-center">
                                                            📱 Show this QR code to the canteen staff for quick pickup
                                                        </p>
                                                        <QRCodeDisplay
                                                            qrCodeBase64={order.qrCodeBase64}
                                                            orderId={order.id}
                                                            size={200}
                                                        />
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

                                            {/* Review Section */}
                                            {order.orderStatus === 'COMPLETED' && (
                                                <div className="mt-6">
                                                    {order.hasReview ? (
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-green-800 font-semibold">✅ Reviewed</span>
                                                        </div>
                                                    ) : canReview(order) ? (
                                                        <button
                                                            onClick={() => handleOpenReviewModal(order)}
                                                            className="block w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition font-semibold shadow-lg text-center transform hover:scale-105 flex items-center justify-center"
                                                        >
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                            </svg>
                                                            ⭐ Write a Review
                                                        </button>
                                                    ) : null}
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

            {/* Review Modal */}
            {selectedOrder && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={handleCloseReviewModal}
                    order={selectedOrder}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}
        </div>
    )
}

export default Orders
