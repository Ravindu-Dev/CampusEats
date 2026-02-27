import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../components/Navbar';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import loyaltyService from '../services/loyaltyService';
import PaymentSuccessModal from '../components/PaymentSuccessModal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/* ─── Stripe Payment Sub-form ─── */
function CheckoutForm({ orderIds, totalAmount, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage('');

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message);
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                await paymentService.confirmPayment(paymentIntent.id, orderIds);
                onSuccess();
            }
        } catch (err) {
            setErrorMessage(err.message || 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stripe element renders inside a white bg box — keep it on a light surface for legibility */}
            <div className="bg-white rounded-2xl p-4">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-base shadow-xl shadow-orange-900/40 hover:shadow-[0_0_30px_rgba(234,88,12,0.45)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pay Rs.{totalAmount.toFixed(2)}
                    </>
                )}
            </button>
        </form>
    );
}

/* ─── Main Checkout Page ─── */
function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, subtotal, clearCart, loading } = useCart();

    const orderType = location.state?.orderType || 'LATER';

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        pickupDate: '',
        pickupTime: '',
        orderType: orderType
    });
    const [errors, setErrors] = useState({});
    const [order, setOrder] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [preservedCartItems, setPreservedCartItems] = useState(null);
    const [minOrderError, setMinOrderError] = useState('');

    const displayItems = cart?.items || preservedCartItems || [];
    const displayTotal = subtotal || (order ? (Array.isArray(order) ? order.reduce((s, o) => s + o.totalAmount, 0) : order.totalAmount) : 0);

    // Loyalty points state
    const [loyaltyAccount, setLoyaltyAccount] = useState(null);
    const [redeemEnabled, setRedeemEnabled] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const loyaltyDiscount = redeemEnabled ? pointsToRedeem : 0; // 1 point = Rs. 1
    const pointsToEarn = Math.floor((displayTotal - loyaltyDiscount) / 10);

    const MINIMUM_ORDER_AMOUNT = 200;

    useEffect(() => {
        if (!loading && !showSuccess && cart && cart.items && cart.items.length === 0) {
            navigate('/menu');
        }
    }, [cart, loading, showSuccess, navigate]);

    // Fetch loyalty account
    useEffect(() => {
        const fetchLoyalty = async () => {
            try {
                const account = await loyaltyService.getAccount();
                setLoyaltyAccount(account);
                setPointsToRedeem(Math.min(account.totalPoints, Math.floor(subtotal)));
            } catch (err) {
                console.error('Error fetching loyalty account:', err);
            }
        };
        fetchLoyalty();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
        if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) newErrors.customerEmail = 'Invalid email format';
        if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(formData.customerPhone)) newErrors.customerPhone = 'Phone number must be 10 digits';
        if (orderType === 'LATER') {
            if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
            if (!formData.pickupTime) newErrors.pickupTime = 'Pickup time is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleProceedToPayment = async (e) => {
        e.preventDefault();
        setMinOrderError('');
        if (!validateForm()) return;
        if (subtotal < MINIMUM_ORDER_AMOUNT) {
            setMinOrderError(`Minimum order amount is Rs. ${MINIMUM_ORDER_AMOUNT.toFixed(2)}. Please add more items to your cart.`);
            return;
        }
        setIsCreatingOrder(true);
        try {
            const orderData = {
                ...formData,
                pointsToRedeem: redeemEnabled ? pointsToRedeem : 0
            };
            const createdOrders = await orderService.createOrder(orderData);
            setOrder(createdOrders);
            const combinedTotal = createdOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            const paymentIntent = await paymentService.createPaymentIntent(createdOrders[0].id, combinedTotal);
            setClientSecret(paymentIntent.clientSecret);
            setShowPayment(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create order. Please try again.');
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handlePaymentSuccess = async () => {
        setPreservedCartItems(cart?.items || []);
        try {
            const updatedOrders = await Promise.all(order.map(o => orderService.getOrderById(o.id)));
            setOrder(updatedOrders);
        } catch (err) {
            console.error('Error fetching updated orders:', err);
        }
        await clearCart();
        setShowSuccess(true);
    };

    // ── Stripe appearance ──
    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#ea580c',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            colorDanger: '#dc2626',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '12px',
        },
    };


    // ── Loading state ──
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!showSuccess && (!cart || !cart.items || cart.items.length === 0)) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Navbar />

            {/* Subtle ambient radial glow */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-orange-600/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Header ── */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center gap-2 text-gray-500 hover:text-orange-400 transition mb-5 text-sm font-medium group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Menu
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {/* Step 1 */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${!showPayment
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-900/30'
                                    : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
                                }`}>
                                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-black ${showPayment ? 'bg-green-500 text-white' : 'bg-white/20'
                                    }`}>
                                    {showPayment ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : '1'}
                                </span>
                                Order Details
                            </div>

                            <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>

                            {/* Step 2 */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${showPayment
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-900/30'
                                    : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
                                }`}>
                                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-black bg-white/20">2</span>
                                Payment
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white mt-5 tracking-tight">Checkout</h1>
                    <p className="text-gray-500 mt-1 text-sm">Complete your order and proceed to payment</p>
                </div>

                {/* ── Two-column layout ── */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* ── Left: Order Summary ── */}
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-7 h-fit">
                        <h2 className="text-lg font-black text-white mb-5 flex items-center gap-3">
                            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-2 rounded-xl shadow-lg shadow-orange-900/30">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            Order Summary
                        </h2>

                        <div className="space-y-3 mb-6">
                            {displayItems.map((item) => (
                                <div
                                    key={item.menuItemId}
                                    className="flex gap-4 p-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl hover:border-orange-500/20 transition-colors"
                                >
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-2xl opacity-20">🍕</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                                        <p className="text-xs text-orange-400/80 font-medium mt-0.5">{item.canteenName}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-600 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                                                x{item.quantity}
                                            </span>
                                            <p className="font-black text-orange-400 text-sm">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-white/[0.06] pt-5 space-y-3">
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                                <p>Subtotal</p>
                                <p className="text-white">Rs.{displayTotal.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 font-medium pb-4 border-b border-white/[0.06] border-dashed">
                                <p>Delivery Fee</p>
                                <p className="text-green-400 font-bold">FREE</p>
                            </div>

                            {/* Loyalty Points Section */}
                            {loyaltyAccount && loyaltyAccount.totalPoints > 0 && !showPayment && (
                                <div className="py-3 border-b border-white/[0.06] border-dashed">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {loyaltyAccount.tier === 'PLATINUM' ? '💎' : loyaltyAccount.tier === 'GOLD' ? '🥇' : loyaltyAccount.tier === 'SILVER' ? '🥈' : '🥉'}
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-white">Loyalty Points</p>
                                                <p className="text-xs text-gray-600">{loyaltyAccount.totalPoints} pts available ({loyaltyAccount.tier})</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={redeemEnabled} onChange={(e) => setRedeemEnabled(e.target.checked)} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-white/10 peer-focus:ring-2 peer-focus:ring-orange-500/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                                        </label>
                                    </div>
                                    {redeemEnabled && (
                                        <div className="mt-3 p-3 bg-orange-500/5 border border-orange-500/15 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-gray-500">Redeem points</span>
                                                <span className="text-sm font-bold text-orange-400">-Rs.{loyaltyDiscount}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={Math.min(loyaltyAccount.totalPoints, Math.floor(displayTotal - 1))}
                                                value={pointsToRedeem}
                                                onChange={(e) => setPointsToRedeem(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                                <span>0 pts</span>
                                                <span>{Math.min(loyaltyAccount.totalPoints, Math.floor(displayTotal - 1))} pts</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {loyaltyDiscount > 0 && (
                                <div className="flex justify-between text-sm font-medium">
                                    <p className="text-green-400">Loyalty Discount</p>
                                    <p className="text-green-400 font-bold">-Rs.{loyaltyDiscount.toFixed(2)}</p>
                                </div>
                            )}

                            <div className="flex justify-between text-xl font-black pt-1">
                                <p className="text-white">Total</p>
                                <p className="text-orange-400">Rs.{(displayTotal - loyaltyDiscount).toFixed(2)}</p>
                            </div>

                            {/* Points to earn info */}
                            {!showPayment && pointsToEarn > 0 && (
                                <div className="flex items-center gap-2 pt-2">
                                    <span className="text-green-400 text-xs">✨</span>
                                    <p className="text-xs text-green-400/80">You'll earn <span className="font-bold text-green-400">{pointsToEarn} points</span> from this order</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right: Form or Payment ── */}
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-7">
                        {!showPayment ? (
                            <>
                                <h2 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-900/30">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    Order Details
                                </h2>

                                {/* Order Type Badge */}
                                <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${orderType === 'NOW'
                                        ? 'bg-green-500/10 border-green-500/20'
                                        : 'bg-blue-500/10 border-blue-500/20'
                                    }`}>
                                    <div className={`p-2 rounded-xl ${orderType === 'NOW' ? 'bg-green-600' : 'bg-blue-600'}`}>
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {orderType === 'NOW' ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            )}
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${orderType === 'NOW' ? 'text-green-400' : 'text-blue-400'}`}>
                                            {orderType === 'NOW' ? 'Order Now' : 'Order Later'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {orderType === 'NOW'
                                                ? 'Your food will be ready for immediate pickup'
                                                : 'Schedule your pickup time below'}
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleProceedToPayment} className="space-y-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${errors.customerName ? 'border-red-500/50 bg-red-500/5' : 'border-white/[0.08] focus:border-orange-500/40'
                                                }`}
                                        />
                                        {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleInputChange}
                                            placeholder="your.email@example.com"
                                            className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${errors.customerEmail ? 'border-red-500/50 bg-red-500/5' : 'border-white/[0.08] focus:border-orange-500/40'
                                                }`}
                                        />
                                        {errors.customerEmail && <p className="text-red-400 text-xs mt-1">{errors.customerEmail}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="customerPhone"
                                            value={formData.customerPhone}
                                            onChange={handleInputChange}
                                            placeholder="10-digit phone number"
                                            maxLength="10"
                                            className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${errors.customerPhone ? 'border-red-500/50 bg-red-500/5' : 'border-white/[0.08] focus:border-orange-500/40'
                                                }`}
                                        />
                                        {errors.customerPhone && <p className="text-red-400 text-xs mt-1">{errors.customerPhone}</p>}
                                    </div>

                                    {/* Pickup Date + Time (LATER only) */}
                                    {orderType === 'LATER' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Pickup Date</label>
                                                <input
                                                    type="date"
                                                    name="pickupDate"
                                                    value={formData.pickupDate}
                                                    onChange={handleInputChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${errors.pickupDate ? 'border-red-500/50 bg-red-500/5' : 'border-white/[0.08] focus:border-orange-500/40'
                                                        }`}
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                                {errors.pickupDate && <p className="text-red-400 text-xs mt-1">{errors.pickupDate}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Pickup Time</label>
                                                <input
                                                    type="time"
                                                    name="pickupTime"
                                                    value={formData.pickupTime}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition ${errors.pickupTime ? 'border-red-500/50 bg-red-500/5' : 'border-white/[0.08] focus:border-orange-500/40'
                                                        }`}
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                                {errors.pickupTime && <p className="text-red-400 text-xs mt-1">{errors.pickupTime}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Min order error */}
                                    {minOrderError && (
                                        <div className="p-4 bg-orange-500/10 border border-orange-500/25 rounded-xl flex items-start gap-3">
                                            <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <p className="text-orange-400 text-sm font-medium">{minOrderError}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isCreatingOrder}
                                        className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-base shadow-xl shadow-orange-900/30 hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group mt-2"
                                    >
                                        {isCreatingOrder ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Creating Order...
                                            </>
                                        ) : (
                                            <>
                                                Proceed to Payment
                                                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-green-600 to-teal-600 p-2 rounded-xl shadow-lg shadow-green-900/30">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    Payment Details
                                </h2>

                                {clientSecret && (
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                                        <CheckoutForm
                                            orderIds={order.map(o => o.id)}
                                            totalAmount={order.reduce((sum, o) => sum + o.totalAmount, 0)}
                                            onSuccess={handlePaymentSuccess}
                                        />
                                    </Elements>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showSuccess && <PaymentSuccessModal onClose={() => navigate('/menu')} orders={order || []} />}
        </div>
    );
}

export default Checkout;
