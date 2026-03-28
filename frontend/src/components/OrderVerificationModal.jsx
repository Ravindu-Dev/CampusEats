import PropTypes from 'prop-types';

function OrderVerificationModal({ order, onConfirm, onCancel, isLoading, error }) {
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

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PENDING': return { label: 'Pending', color: '#facc15', bg: 'rgba(234,179,8,0.15)' };
            case 'PREPARING': return { label: 'Preparing', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' };
            case 'READY': return { label: 'Ready for Pickup', color: '#4ade80', bg: 'rgba(34,197,94,0.15)' };
            case 'COMPLETED': return { label: 'Completed', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' };
            default: return { label: status, color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' };
        }
    };

    const statusInfo = getStatusInfo(order.orderStatus);
    const canHandoff = order.orderStatus === 'READY';

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onCancel}></div>

            {/* Modal — scrollable wrapper */}
            <div className="relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                <div className="p-8 text-white">
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
                        {/* Close button */}
                        <button
                            onClick={onCancel}
                            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors text-gray-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Order Status Badge */}
                    <div className="mb-6 flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400">Current Status:</span>
                        <span
                            className="px-3 py-1.5 rounded-full text-sm font-bold"
                            style={{ background: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.color}30` }}
                        >
                            {statusInfo.label}
                        </span>
                    </div>

                    {/* Error Message Inside Modal */}
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444' }} className="mb-6 rounded-r-xl p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-bold text-[#f87171] text-sm">Handoff Failed</p>
                                    <p className="text-sm text-[#fca5a5] mt-0.5">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Not Ready Warning */}
                    {!canHandoff && !error && (
                        <div style={{ background: 'rgba(234,179,8,0.1)', borderLeft: '4px solid #eab308' }} className="mb-6 rounded-r-xl p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-[#facc15] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <p className="font-bold text-[#facc15] text-sm">Order Not Ready</p>
                                    <p className="text-sm text-[#fde68a] mt-0.5">
                                        This order must be marked as &quot;Ready&quot; in the Kitchen Dashboard before it can be handed off.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {order.orderItems?.map((item, index) => (
                                <div key={index} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} className="flex justify-between items-center p-4 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        {item.imageUrl && (
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[rgba(255,255,255,0.05)] flex-shrink-0 border border-[rgba(255,255,255,0.1)]">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-200">{item.name}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">Qty: <span className="text-gray-300 font-semibold">{item.quantity}</span></p>
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
                                <p className="text-4xl font-black mt-1 drop-shadow-md">Rs.{order.totalAmount?.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-white/80 font-medium tracking-wide uppercase">Payment Status</p>
                                <p className="text-xl font-bold mt-1 tracking-wider drop-shadow-md">
                                    <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur">{order.paymentStatus}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons — sticky at bottom */}
                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 h-14 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-gray-300 rounded-xl font-bold hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading || !canHandoff}
                            className={`flex-1 h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                canHandoff
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5'
                                    : 'bg-[rgba(255,255,255,0.05)] text-gray-500 cursor-not-allowed border border-[rgba(255,255,255,0.1)]'
                            }`}
                            title={!canHandoff ? 'Order must be "Ready" before handoff' : ''}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Confirm Handoff</span>
                                </>
                            )}
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
        orderStatus: PropTypes.string,
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
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.string
};

export default OrderVerificationModal;

