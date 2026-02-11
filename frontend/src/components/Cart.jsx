import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function Cart() {
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

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Sidebar */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md pointer-events-auto">
                    <div className="h-full flex flex-col bg-white shadow-2xl rounded-l-3xl overflow-hidden border-l border-white/20">
                        {/* Header */}
                        <div className="px-6 py-6 bg-gradient-to-r from-orange-600 to-red-600 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Your Cart</h2>
                                        <p className="text-orange-100 text-sm">{itemCount} items selected</p>
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

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                            {!cart || cart.items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="text-7xl mb-6 opacity-40">🛒</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                                    <p className="text-gray-500 max-w-[200px] mb-8">
                                        Looks like you haven't added any delicious food yet!
                                    </p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-700 transition"
                                    >
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cart.items.map((item) => (
                                        <div key={item.menuItemId} className="flex gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 group hover:shadow-md transition-all">
                                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-inner">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-3xl opacity-20">🍕</div>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition truncate w-40">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-xs text-orange-500 font-medium">
                                                            {item.canteenName}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.menuItemId)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex-1 flex items-end justify-between">
                                                    <p className="font-bold text-orange-600">₹{item.price}</p>
                                                    <div className="flex items-center bg-white border border-orange-200 rounded-xl px-1 py-1 shadow-sm">
                                                        <button
                                                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                                            className="p-1 hover:bg-orange-50 rounded-lg text-orange-600 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                            </svg>
                                                        </button>
                                                        <span className="px-3 font-bold text-gray-700 min-w-[2rem] text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                                            className="p-1 hover:bg-orange-50 rounded-lg text-orange-600 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart && cart.items.length > 0 && (
                            <div className="border-t border-gray-100 px-6 py-8 bg-gray-50/50">
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-base text-gray-600 font-medium">
                                        <p>Subtotal</p>
                                        <p>₹{subtotal.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between text-base text-gray-600 font-medium pb-2 border-b border-gray-200 border-dashed">
                                        <p>Delivery Fee</p>
                                        <p className="text-green-600">FREE</p>
                                    </div>
                                    <div className="flex justify-between text-xl font-black text-gray-900">
                                        <p>Grand Total</p>
                                        <p className="text-orange-600">₹{subtotal.toFixed(2)}</p>
                                    </div>
                                </div>

                                <button
                                    className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 transform active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                >
                                    Proceed to Checkout
                                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                                <p className="text-center mt-4 text-xs text-gray-400">
                                    Secure and safe payments only with CampusEats
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
