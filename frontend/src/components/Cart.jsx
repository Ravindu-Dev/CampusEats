import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import OrderTypeModal from './OrderTypeModal';

function Cart() {
    const navigate = useNavigate();
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        updateQuantity,
        removeItem,
        subtotal,
        itemCount,
        loading
    } = useCart();

    const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);

    const handleProceedToCheckout = () => setShowOrderTypeModal(true);

    const handleSelectOrderType = (orderType) => {
        setIsCartOpen(false);
        navigate('/checkout', { state: { orderType } });
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md pointer-events-auto">
                    <div className="h-full flex flex-col bg-[#0d0d0d] shadow-2xl rounded-l-3xl overflow-hidden border-l border-white/[0.07]">

                        {/* ── Header ── */}
                        <div className="px-6 py-6 bg-gradient-to-r from-orange-600 to-red-600 text-white flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black">Your Cart</h2>
                                        <p className="text-orange-100 text-sm">{itemCount} {itemCount === 1 ? 'item' : 'items'} selected</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* ── Items ── */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                            {!cart || cart.items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                                    <div className="text-7xl mb-6 opacity-25">🛒</div>
                                    <h3 className="text-xl font-black text-white mb-2">Your cart is empty</h3>
                                    <p className="text-gray-600 max-w-[200px] mb-8 text-sm">
                                        Looks like you haven't added any delicious food yet!
                                    </p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-[0_0_25px_rgba(234,88,12,0.4)] transition"
                                    >
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                cart.items.map((item) => (
                                    <div
                                        key={item.menuItemId}
                                        className="flex gap-4 p-4 bg-white/[0.04] border border-white/[0.07] rounded-2xl group hover:border-orange-500/20 transition-all"
                                    >
                                        {/* Image */}
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-3xl opacity-20">🍕</div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-1 flex-col">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <h4 className="font-bold text-white group-hover:text-orange-300 transition text-sm truncate w-44">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-xs text-orange-500/80 font-medium">{item.canteenName}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.menuItemId)}
                                                    className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <p className="font-black text-orange-400 text-sm">Rs.{item.price}</p>

                                                {/* Qty controls */}
                                                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-1 py-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                                        className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <span className="px-3 font-black text-white min-w-[2rem] text-center text-sm">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                                        className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* ── Footer ── */}
                        {cart && cart.items.length > 0 && (
                            <div className="border-t border-white/[0.07] px-6 py-6 bg-[#111] flex-shrink-0">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <p>Subtotal</p>
                                        <p className="text-white">Rs.{subtotal.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 font-medium pb-3 border-b border-white/[0.06] border-dashed">
                                        <p>Delivery Fee</p>
                                        <p className="text-green-400 font-bold">FREE</p>
                                    </div>
                                    <div className="flex justify-between text-lg font-black pt-1">
                                        <p className="text-white">Grand Total</p>
                                        <p className="text-orange-400">Rs.{subtotal.toFixed(2)}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProceedToCheckout}
                                    className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-base shadow-xl hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                >
                                    Proceed to Checkout
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                                <p className="text-center mt-3 text-xs text-white/20">
                                    🔒 Secure and safe payments only with CampusEats
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Order Type Modal */}
            <OrderTypeModal
                isOpen={showOrderTypeModal}
                onClose={() => setShowOrderTypeModal(false)}
                onSelectOrderType={handleSelectOrderType}
            />
        </div>
    );
}

export default Cart;
