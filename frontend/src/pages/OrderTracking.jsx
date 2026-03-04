import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import orderService from '../services/orderService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function OrderTracking() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const data = await orderService.getOrderStatus(orderId)
                if (data.orderStatus === 'READY' && order?.orderStatus !== 'READY') {
                    setShowConfetti(true)
                    setTimeout(() => setShowConfetti(false), 5000)
                }
                setOrder(data)
                setError('')
            } catch (err) {
                console.error('Error fetching order status:', err)
                setError('Failed to load order status')
            } finally {
                setLoading(false)
            }
        }
        fetchOrderStatus()
        const pollInterval = setInterval(fetchOrderStatus, 5000)
        return () => clearInterval(pollInterval)
    }, [orderId, order?.orderStatus])

    const statusOrder = ['PENDING', 'PREPARING', 'READY', 'COMPLETED']

    const getStepStatus = (stepStatus) => {
        if (!order) return 'upcoming'
        const currentIndex = statusOrder.indexOf(order.orderStatus)
        const stepIndex = statusOrder.indexOf(stepStatus)
        if (stepIndex < currentIndex) return 'completed'
        if (stepIndex === currentIndex) return 'current'
        return 'upcoming'
    }

    const stepConfig = {
        PENDING: { icon: '🕐', title: 'Order Received', desc: 'Your order has been received and is waiting to be prepared' },
        PREPARING: { icon: '🔥', title: 'Preparing Your Food', desc: 'The kitchen is preparing your delicious meal' },
        READY: { icon: '✅', title: 'Ready for Pickup', desc: 'Your order is ready! Please pick it up at the canteen' },
        COMPLETED: { icon: '🎉', title: 'Order Completed', desc: 'Thank you for your order! Enjoy your meal' }
    }

    const getTimestamp = (stepStatus) => {
        if (!order) return null
        switch (stepStatus) {
            case 'PENDING': return order.createdAt
            case 'PREPARING': return order.preparedAt
            case 'READY': return order.readyAt
            case 'COMPLETED': return order.completedAt
            default: return null
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]">
                <Navbar />
                <div className="flex flex-col justify-center items-center py-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 mb-4" />
                    <p className="text-white/40 text-sm font-medium">Loading order status...</p>
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl text-sm font-medium">
                        {error || 'Order not found'}
                    </div>
                    <Link to="/profile?tab=orders" className="inline-flex items-center gap-2 mt-4 text-white/50 hover:text-orange-400 transition-colors text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Orders
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    const currentStepIndex = statusOrder.indexOf(order.orderStatus)

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
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

                {/* Back Link + Header */}
                <div className="mb-8">
                    <Link to="/profile?tab=orders" className="inline-flex items-center gap-2 text-white/40 hover:text-orange-400 transition-colors text-sm font-bold mb-5 group">
                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Orders
                    </Link>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white">Track Your Order</h1>
                            <p className="text-white/40 text-sm font-medium mt-1">Order #{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${order.orderStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                order.orderStatus === 'READY' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                    order.orderStatus === 'PREPARING' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                            {order.orderStatus}
                        </div>
                    </div>
                </div>

                {/* Ready Alert */}
                {order.orderStatus === 'READY' && (
                    <div className="mb-8 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                                🎉
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-emerald-400">Your Order is Ready!</h3>
                                <p className="text-white/50 text-sm mt-0.5">Please pick up your order at the canteen</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white font-bold text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Order Progress
                        </h2>
                        <span className="text-orange-400 text-sm font-bold">{Math.round(((currentStepIndex + 1) / statusOrder.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${order.orderStatus === 'COMPLETED'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                                }`}
                            style={{ width: `${((currentStepIndex + 1) / statusOrder.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Order Progress Steps */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-6">
                    <div className="space-y-0">
                        {statusOrder.map((stepStatus, index) => {
                            const status = getStepStatus(stepStatus)
                            const timestamp = getTimestamp(stepStatus)
                            const config = stepConfig[stepStatus]
                            const isLast = index === statusOrder.length - 1

                            return (
                                <div key={stepStatus} className="relative flex gap-4 sm:gap-6">
                                    {/* Timeline */}
                                    <div className="flex flex-col items-center">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-xl flex-shrink-0 transition-all duration-500 ${status === 'completed'
                                                ? 'bg-emerald-500/20 ring-2 ring-emerald-500/30'
                                                : status === 'current'
                                                    ? 'bg-orange-500/20 ring-2 ring-orange-500/40 animate-pulse'
                                                    : 'bg-white/[0.04] ring-1 ring-white/10'
                                            }`}>
                                            {status === 'completed' ? (
                                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className={status === 'upcoming' ? 'opacity-30' : ''}>{config.icon}</span>
                                            )}
                                        </div>
                                        {!isLast && (
                                            <div className={`w-0.5 h-16 my-1 rounded-full transition-all duration-500 ${status === 'completed' ? 'bg-emerald-500/40' : 'bg-white/[0.06]'
                                                }`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                                        <h3 className={`text-base font-bold transition-colors ${status === 'current' ? 'text-orange-400' :
                                                status === 'completed' ? 'text-emerald-400' :
                                                    'text-white/25'
                                            }`}>
                                            {config.title}
                                        </h3>
                                        <p className={`text-xs mt-0.5 ${status === 'upcoming' ? 'text-white/15' : 'text-white/40'}`}>
                                            {config.desc}
                                        </p>
                                        {timestamp && (
                                            <p className="text-xs text-white/30 mt-1.5 font-mono">
                                                {new Date(timestamp).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
                        <span className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </span>
                        Order Details
                    </h2>

                    {/* Pickup Info */}
                    <div className="bg-orange-500/[0.06] border border-orange-500/10 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Pickup Time</p>
                                <p className="text-white font-bold text-sm mt-0.5">
                                    {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Items</h3>
                    <div className="space-y-2 mb-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/[0.05]">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xl">🍱</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-sm truncate">{item.name}</p>
                                    <p className="text-white/30 text-xs">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-white text-sm">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-white/[0.06] pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/50 font-bold text-sm">Total Amount</span>
                            <span className="text-xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                Rs.{order.totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

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
    )
}

export default OrderTracking
