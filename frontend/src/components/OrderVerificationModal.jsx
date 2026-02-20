import PropTypes from 'prop-types';

function OrderVerificationModal({ order, onConfirm, onCancel }) {
    if (!order) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return timeString;
    };

    return (
        <div className="fixed inset-0 z-[80] overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }} className="rounded-3xl shadow-2xl max-w-3xl w-full p-8 my-8 transform scale-100 opacity-100 transition-all text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">Order Verified</h2>
                                <p className="text-sm text-gray-400 mt-1">Order #{order.id.substring(0, 12)}...</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }} className="rounded-2xl p-6 mb-6">
                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-blue-400/70 mb-1 uppercase tracking-wider font-bold">Name</p>
                                <p className="font-semibold text-gray-200">{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-400/70 mb-1 uppercase tracking-wider font-bold">Phone</p>
                                <p className="font-semibold text-gray-200">{order.customerPhone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-400/70 mb-1 uppercase tracking-wider font-bold">Email</p>
                                <p className="font-semibold text-gray-200 text-sm">{order.customerEmail}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-400/70 mb-1 uppercase tracking-wider font-bold">Pickup</p>
                                <p className="font-semibold text-gray-200">
                                    {formatDate(order.pickupDate)} at {formatTime(order.pickupTime)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)' }} className="rounded-2xl p-6 mb-6">
                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Order Items ({order.orderItems?.length || 0})
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {order.orderItems?.map((item, index) => (
                                <div key={index} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} className="flex justify-between items-center p-4 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        {item.imageUrl && (
                                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-[rgba(255,255,255,0.05)] flex-shrink-0 border border-[rgba(255,255,255,0.1)]">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-200">{item.name}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">Quantity: <span className="text-gray-300 font-semibold">{item.quantity}</span></p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-orange-400 text-lg">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-white/80 font-medium tracking-wide uppercase">Total Amount</p>
                                <p className="text-4xl font-black mt-1 shadow-black drop-shadow-md">Rs.{order.totalAmount?.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-white/80 font-medium tracking-wide uppercase">Payment Status</p>
                                <p className="text-xl font-bold mt-1 tracking-wider shadow-black drop-shadow-md">
                                    <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur">{order.paymentStatus}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 h-14 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-gray-300 rounded-xl font-bold hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Handoff
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

OrderVerificationModal.propTypes = {
    order: PropTypes.shape({
        id: PropTypes.string.isRequired,
        customerName: PropTypes.string,
        customerEmail: PropTypes.string,
        customerPhone: PropTypes.string,
        pickupDate: PropTypes.string,
        pickupTime: PropTypes.string,
        orderItems: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            quantity: PropTypes.number,
            price: PropTypes.number,
            imageUrl: PropTypes.string
        })),
        totalAmount: PropTypes.number,
        paymentStatus: PropTypes.string
    }),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default OrderVerificationModal;
