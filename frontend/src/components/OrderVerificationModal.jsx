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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 my-8 transform scale-100 opacity-100 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Order Verified</h2>
                                <p className="text-sm text-gray-500">Order #{order.id.substring(0, 12)}...</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Name</p>
                                <p className="font-semibold text-gray-900">{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Phone</p>
                                <p className="font-semibold text-gray-900">{order.customerPhone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Email</p>
                                <p className="font-semibold text-gray-900 text-sm">{order.customerEmail}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Pickup</p>
                                <p className="font-semibold text-gray-900">
                                    {formatDate(order.pickupDate)} at {formatTime(order.pickupTime)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 mb-6 border-2 border-orange-200">
                        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Order Items ({order.orderItems?.length || 0})
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {order.orderItems?.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-4">
                                        {item.imageUrl && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-orange-600">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-90">Total Amount</p>
                                <p className="text-3xl font-black">Rs.{order.totalAmount?.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-90">Payment Status</p>
                                <p className="text-lg font-bold uppercase">{order.paymentStatus}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 h-14 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 h-14 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
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
