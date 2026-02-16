import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import OrderVerificationModal from '../components/OrderVerificationModal';
import qrService from '../services/qrService';
import orderService from '../services/orderService';
import canteenAuthService from '../services/canteenAuthService';

function ScanQRPage() {
    const navigate = useNavigate();
    const [scannedOrder, setScannedOrder] = useState(null);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [canteenOwner, setCanteenOwner] = useState(null);
    const [manualOrderId, setManualOrderId] = useState('');

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner();
        if (!owner) {
            navigate('/canteen/login');
            return;
        }
        setCanteenOwner(owner);
    }, [navigate]);

    const handleScanSuccess = async (scannedData) => {
        if (!canteenOwner?.canteenId) {
            setError('Canteen information not found. Please log in again.');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const orderData = await qrService.verifyQRCode(scannedData, canteenOwner.canteenId);
            setScannedOrder(orderData);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to verify QR code';
            setError(errorMessage);

            // Auto-clear error after 5 seconds
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleScanError = (error) => {
        console.error('Scan error:', error);
    };

    const handleManualVerify = async (e) => {
        e.preventDefault();
        if (!manualOrderId.trim() || !canteenOwner?.canteenId) return;

        setIsVerifying(true);
        setError('');

        try {
            const orderData = await qrService.verifyQRCode(manualOrderId.trim(), canteenOwner.canteenId);
            setScannedOrder(orderData);
            setManualOrderId(''); // Clear input after successful verification
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to verify order';
            setError(errorMessage);

            // Auto-clear error after 5 seconds
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleConfirmHandoff = async () => {
        if (!scannedOrder || !canteenOwner?.canteenId) return;

        setIsVerifying(true);
        setError('');

        try {
            // Update order status to COMPLETED
            await orderService.updateOrderStatus(
                scannedOrder.id,
                'COMPLETED',
                canteenOwner.canteenId
            );

            // Close modal
            setScannedOrder(null);

            // Navigate to canteen orders page
            navigate('/canteen/orders', {
                state: {
                    successMessage: `Order #${scannedOrder.id.substring(0, 8)}... handed off successfully!`,
                    highlightOrderId: scannedOrder.id
                }
            });
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to confirm handoff';
            setError(errorMessage);

            // Auto-clear error after 5 seconds
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCancelVerification = () => {
        setScannedOrder(null);
        setError('');
    };

    if (!canteenOwner) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/canteen/dashboard"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                            >
                                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="font-medium">Back</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">QR Code Scanner</h1>
                                <p className="text-xs text-gray-500">Verify customer orders</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-700">Ready to Scan</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm animate-shake">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="font-semibold text-red-800">Verification Failed</p>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                            <button
                                onClick={() => setError('')}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading Overlay */}
                {isVerifying && (
                    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
                            <p className="font-semibold text-blue-800">Verifying order...</p>
                        </div>
                    </div>
                )}

                {/* Scanner Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Camera Scanner</h2>
                            <p className="text-sm text-gray-500">Point camera at customer's QR code</p>
                        </div>
                    </div>

                    <QRScanner
                        onScanSuccess={handleScanSuccess}
                        onScanError={handleScanError}
                    />
                </div>

                {/* Manual Entry Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Manual Entry</h2>
                            <p className="text-sm text-gray-500">Enter order ID if camera isn't working</p>
                        </div>
                    </div>

                    <form onSubmit={handleManualVerify} className="space-y-4">
                        <div>
                            <label htmlFor="orderId" className="block text-sm font-semibold text-gray-700 mb-2">
                                Order ID
                            </label>
                            <input
                                type="text"
                                id="orderId"
                                value={manualOrderId}
                                onChange={(e) => setManualOrderId(e.target.value)}
                                placeholder="Enter order ID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-gray-900 placeholder-gray-400"
                                disabled={isVerifying}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!manualOrderId.trim() || isVerifying}
                            className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isVerifying ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Verify Order</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Verification Modal */}
            {scannedOrder && (
                <OrderVerificationModal
                    order={scannedOrder}
                    onConfirm={handleConfirmHandoff}
                    onCancel={handleCancelVerification}
                />
            )}
        </div>
    );
}

export default ScanQRPage;
