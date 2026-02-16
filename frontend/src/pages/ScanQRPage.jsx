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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/canteen/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-semibold">Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl">🍔</div>
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                CampusEats
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl mb-4 shadow-xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Scan QR Code</h1>
                    <p className="text-lg text-gray-600">Scan customer's QR code to verify their order</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-bold text-red-900">Verification Failed</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Verifying Overlay */}
                {isVerifying && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex items-center justify-center gap-3">
                            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-bold text-blue-900">Verifying order...</p>
                        </div>
                    </div>
                )}

                {/* QR Scanner */}
                <QRScanner
                    onScanSuccess={handleScanSuccess}
                    onScanError={handleScanError}
                />

                {/* Manual Entry Option */}
                <div className="max-w-2xl mx-auto mt-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-900 mb-3">Manual Order ID Entry</h3>
                        <p className="text-sm text-gray-600 mb-4">If scanning doesn't work, you can manually enter the order ID</p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Enter Order ID"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        handleScanSuccess(e.target.value.trim());
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    const input = e.target.previousElementSibling;
                                    if (input.value.trim()) {
                                        handleScanSuccess(input.value.trim());
                                        input.value = '';
                                    }
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Order Verification Modal */}
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
