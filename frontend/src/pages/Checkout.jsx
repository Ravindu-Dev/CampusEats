import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../components/Navbar';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import PaymentSuccessModal from '../components/PaymentSuccessModal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ orderIds, totalAmount, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

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
                // Confirm payment on backend with all order IDs
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
            <PaymentElement />

            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        Pay Rs.{totalAmount.toFixed(2)}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </>
                )}
            </button>
        </form>
    );
}

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, subtotal, clearCart, loading } = useCart();

    // Get order type from navigation state, default to 'LATER' for backward compatibility
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

    const MINIMUM_ORDER_AMOUNT = 200; // Rs. 200 minimum (Stripe requires ~$0.50 USD ≈ Rs. 165)

    useEffect(() => {
        // Only redirect if cart is loaded and empty (not during initial load)
        // AND success modal is not being shown
        if (!loading && !showSuccess && cart && cart.items && cart.items.length === 0) {
            navigate('/menu');
        }
    }, [cart, loading, showSuccess, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Name is required';
        }

        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
            newErrors.customerEmail = 'Invalid email format';
        }

        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.customerPhone)) {
            newErrors.customerPhone = 'Phone number must be 10 digits';
        }

        // Only validate date/time for LATER orders
        if (orderType === 'LATER') {
            if (!formData.pickupDate) {
                newErrors.pickupDate = 'Pickup date is required';
            }

            if (!formData.pickupTime) {
                newErrors.pickupTime = 'Pickup time is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleProceedToPayment = async (e) => {
        e.preventDefault();
        setMinOrderError('');

        if (!validateForm()) {
            return;
        }

        // Stripe minimum: ~$0.50 USD ≈ Rs. 165 LKR. We enforce Rs. 200 for a safe buffer.
        if (subtotal < MINIMUM_ORDER_AMOUNT) {
            setMinOrderError(`Minimum order amount is Rs. ${MINIMUM_ORDER_AMOUNT.toFixed(2)}. Please add more items to your cart.`);
            return;
        }

        setIsCreatingOrder(true);

        try {
            // Create orders (backend will split by canteen)
            const createdOrders = await orderService.createOrder(formData);
            setOrder(createdOrders); // Store array of orders

            // Calculate combined total from all orders
            const combinedTotal = createdOrders.reduce((sum, order) => sum + order.totalAmount, 0);

            // Create single payment intent for combined total
            // We'll use the first order ID as reference, but store all IDs for confirmation
            const paymentIntent = await paymentService.createPaymentIntent(
                createdOrders[0].id,
                combinedTotal
            );

            setClientSecret(paymentIntent.clientSecret);
            setShowPayment(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create order. Please try again.');
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handlePaymentSuccess = async () => {
        // Preserve cart items before clearing
        setPreservedCartItems(cart?.items || []);

        // Fetch updated orders with QR codes
        try {
            const updatedOrders = await Promise.all(
                order.map(o => orderService.getOrderById(o.id))
            );
            setOrder(updatedOrders);
        } catch (err) {
            console.error('Error fetching updated orders:', err);
        }

        await clearCart();
        setShowSuccess(true);
    };

    // Show loading state while cart is being fetched
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading checkout...</p>
                </div>
            </div>
        );
    }

    // Allow rendering if showing success modal, even if cart is empty
    if (!showSuccess && (!cart || !cart.items || cart.items.length === 0)) {
        return null;
    }

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

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Menu
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600 mt-2">Complete your order and proceed to payment</p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Order Summary */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 h-fit">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-2 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            Order Summary
                        </h2>

                        <div className="space-y-4 mb-6">
                            {(cart?.items || preservedCartItems || []).map((item) => (
                                <div key={item.menuItemId} className="flex gap-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-3xl opacity-20">🍕</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                        <p className="text-xs text-orange-500 font-medium">{item.canteenName}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            <p className="font-bold text-orange-600">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-6 space-y-3">
                            <div className="flex justify-between text-base text-gray-600">
                                <p>Subtotal</p>
                                <p>Rs.{(subtotal || (order ? (Array.isArray(order) ? order.reduce((sum, o) => sum + o.totalAmount, 0) : order.totalAmount) : 0)).toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between text-base text-gray-600 pb-3 border-b border-gray-200 border-dashed">
                                <p>Delivery Fee</p>
                                <p className="text-green-600 font-medium">FREE</p>
                            </div>
                            <div className="flex justify-between text-2xl font-black text-gray-900">
                                <p>Total</p>
                                <p className="text-orange-600">Rs.{(subtotal || (order ? (Array.isArray(order) ? order.reduce((sum, o) => sum + o.totalAmount, 0) : order.totalAmount) : 0)).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Details Form or Payment */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        {!showPayment ? (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    Order Details
                                </h2>

                                {/* Order Type Badge */}
                                <div className={`mb-6 p-4 rounded-xl border-2 ${orderType === 'NOW'
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${orderType === 'NOW' ? 'bg-green-600' : 'bg-blue-600'
                                            }`}>
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {orderType === 'NOW' ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                )}
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`font-bold ${orderType === 'NOW' ? 'text-green-800' : 'text-blue-800'}`}>
                                                {orderType === 'NOW' ? 'Order Now' : 'Order Later'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {orderType === 'NOW'
                                                    ? 'Your food will be ready for immediate pickup'
                                                    : 'Schedule your pickup time below'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleProceedToPayment} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border ${errors.customerName ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border ${errors.customerEmail ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                                            placeholder="your.email@example.com"
                                        />
                                        {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="customerPhone"
                                            value={formData.customerPhone}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border ${errors.customerPhone ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                                            placeholder="10-digit phone number"
                                            maxLength="10"
                                        />
                                        {errors.customerPhone && <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>}
                                    </div>

                                    {/* Conditionally render pickup date/time for LATER orders */}
                                    {orderType === 'LATER' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                                                <input
                                                    type="date"
                                                    name="pickupDate"
                                                    value={formData.pickupDate}
                                                    onChange={handleInputChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className={`w-full px-4 py-3 border ${errors.pickupDate ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                                                />
                                                {errors.pickupDate && <p className="text-red-500 text-sm mt-1">{errors.pickupDate}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                                                <input
                                                    type="time"
                                                    name="pickupTime"
                                                    value={formData.pickupTime}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 border ${errors.pickupTime ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition`}
                                                />
                                                {errors.pickupTime && <p className="text-red-500 text-sm mt-1">{errors.pickupTime}</p>}
                                            </div>
                                        </>
                                    )}

                                    {minOrderError && (
                                        <div className="p-4 bg-orange-50 border border-orange-300 rounded-xl flex items-start gap-3">
                                            <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <p className="text-orange-700 text-sm font-medium">{minOrderError}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isCreatingOrder}
                                        className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {isCreatingOrder ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Creating Order...
                                            </>
                                        ) : (
                                            <>
                                                Proceed to Payment
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-green-600 to-teal-600 p-2 rounded-xl">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    Payment Details
                                </h2>

                                {clientSecret && (
                                    <Elements stripe={stripePromise} options={options}>
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
