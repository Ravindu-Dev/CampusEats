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
        <div className="w-full mx-auto">
            {/* Scanner Container */}
            <div className="relative">
                <div
                    id="qr-reader"
                    className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200"
                ></div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-base text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Scanning Instructions
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span>Ask customer to show their QR code</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span>Position QR code within the camera frame</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span>Hold steady - detection is automatic</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold mt-0.5">💡</span>
                        <span>Ensure good lighting for best results</span>
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
