import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import OrderVerificationModal from '../components/OrderVerificationModal';
import qrService from '../services/qrService';
import orderService from '../services/orderService';
import canteenAuthService from '../services/canteenAuthService';
import CanteenLayout from '../components/CanteenLayout';

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
        <CanteenLayout pageTitle="QR Code Scanner" pageSubtitle="Verify customer orders via QR code or Order ID">
            <div className="max-w-4xl mx-auto">
                {/* Status Header */}
                <div className="flex justify-end mb-6">
                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }} className="flex items-center gap-2 px-4 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-[#4ade80]">Ready to Scan</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444' }} className="mb-6 rounded-r-xl p-4 shadow-sm animate-shake">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-[#ef4444] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="font-bold text-[#f87171]">Verification Failed</p>
                                <p className="text-sm text-[#fca5a5] mt-1">{error}</p>
                            </div>
                            <button
                                onClick={() => setError('')}
                                className="text-[#f87171] hover:text-white transition-colors"
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
                    <div style={{ background: 'rgba(59,130,246,0.1)', borderLeft: '4px solid #3b82f6' }} className="mb-6 rounded-r-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#60a5fa] border-t-transparent"></div>
                            <p className="font-bold text-[#60a5fa]">Verifying order...</p>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Scanner Section */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-xl p-8">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Camera Scanner</h2>
                                <p className="text-sm text-gray-400 mt-1">Point camera at customer's QR code</p>
                            </div>
                        </div>

                        <div className="rounded-xl overflow-hidden border-2 border-dashed border-[rgba(255,255,255,0.1)] hover:border-orange-500/50 transition-colors p-2 bg-[rgba(0,0,0,0.2)]">
                            <QRScanner
                                onScanSuccess={handleScanSuccess}
                                onScanError={handleScanError}
                            />
                        </div>
                    </div>

                    {/* Manual Entry Section */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-xl p-8">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Manual Entry</h2>
                                <p className="text-sm text-gray-400 mt-1">Enter order ID if camera isn't working</p>
                            </div>
                        </div>

                        <form onSubmit={handleManualVerify} className="space-y-6">
                            <div>
                                <label htmlFor="orderId" className="block text-sm font-medium text-gray-400 mb-2">
                                    Order ID
                                </label>
                                <input
                                    type="text"
                                    id="orderId"
                                    value={manualOrderId}
                                    onChange={(e) => setManualOrderId(e.target.value)}
                                    placeholder="e.g., 550e8400-e29b-41d4-..."
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    className="w-full px-4 py-3.5 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none placeholder-gray-600"
                                    disabled={isVerifying}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!manualOrderId.trim() || isVerifying}
                                className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.5)] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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
        </CanteenLayout>
    );
}

export default ScanQRPage;
