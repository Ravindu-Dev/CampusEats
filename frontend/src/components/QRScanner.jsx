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
        let initTimeout;

        const initScanner = () => {
            // If scanner instance already exists, skip
            if (scannerRef.current) {
                return;
            }

            // Clear any leftover DOM content from previous scanner instances
            // This prevents the double camera issue on refresh / StrictMode re-run
            const container = document.getElementById('qr-reader');
            if (container) {
                container.innerHTML = '';
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
            if (isMountedRef.current) {
                setIsScanning(true);
                scannerRef.current = scanner;
            }
        };

        // Small delay to let any prior cleanup complete (handles StrictMode double-invoke)
        initTimeout = setTimeout(initScanner, 100);

        return () => {
            isMountedRef.current = false;
            clearTimeout(initTimeout);
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
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                ></div>
            </div>

            {/* Instructions */}
            <div
                className="mt-6 rounded-xl p-5"
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)'
                }}
            >
                <h3 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: '#e5e7eb' }}>
                    <svg className="w-5 h-5" style={{ color: '#f97316' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Scanning Instructions
                </h3>
                <ul className="space-y-2.5 text-sm" style={{ color: '#9ca3af' }}>
                    <li className="flex items-start gap-2.5">
                        <span className="mt-0.5" style={{ color: '#f97316' }}>•</span>
                        <span>Ask customer to show their QR code</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="mt-0.5" style={{ color: '#f97316' }}>•</span>
                        <span>Position QR code within the camera frame</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="mt-0.5" style={{ color: '#f97316' }}>•</span>
                        <span>Hold steady - detection is automatic</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="mt-0.5">💡</span>
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
