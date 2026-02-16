import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import PropTypes from 'prop-types';

function QRScanner({ onScanSuccess, onScanError }) {
    const scannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const isMountedRef = useRef(true);
    const callbacksRef = useRef({ onScanSuccess, onScanError });

    // Update callbacks ref when props change
    useEffect(() => {
        callbacksRef.current = { onScanSuccess, onScanError };
    }, [onScanSuccess, onScanError]);

    useEffect(() => {
        isMountedRef.current = true;

        // Only initialize if scanner doesn't exist
        if (scannerRef.current) {
            return;
        }

        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 20,
                qrbox: { width: 300, height: 300 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                verbose: false,
                rememberLastUsedCamera: true
            },
            false
        );

        const handleSuccess = (decodedText) => {
            if (!isMountedRef.current) return;

            setIsScanning(false);

            // Stop scanner immediately
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }

            // Call the callback
            if (callbacksRef.current.onScanSuccess) {
                callbacksRef.current.onScanSuccess(decodedText);
            }
        };

        const handleError = (error) => {
            if (!isMountedRef.current) return;

            // Ignore frequent scan errors
            if (error.includes('NotFoundException')) {
                return;
            }

            if (callbacksRef.current.onScanError) {
                callbacksRef.current.onScanError(error);
            }
        };

        scanner.render(handleSuccess, handleError);
        setIsScanning(true);
        scannerRef.current = scanner;

        return () => {
            isMountedRef.current = false;
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, []); // Empty dependency array - only run once on mount

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Scanner Container */}
            <div className="relative">
                <div
                    id="qr-reader"
                    className="rounded-2xl overflow-hidden shadow-2xl border-4 border-orange-200"
                ></div>

                {/* Scanning Overlay */}
                {isScanning && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                            <span className="font-bold">Scanning for QR code...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to Scan
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>Ask the customer to show their QR code on their phone</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>Position the QR code within the green camera frame</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>Hold steady - detection is automatic (takes 1-2 seconds)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">💡</span>
                        <span>Ensure good lighting and the QR code is clear and not blurry</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

QRScanner.propTypes = {
    onScanSuccess: PropTypes.func.isRequired,
    onScanError: PropTypes.func
};

export default QRScanner;
