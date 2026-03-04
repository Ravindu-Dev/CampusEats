import PropTypes from 'prop-types'

function QRCodeDisplay({ qrCodeBase64, orderId, size = 300 }) {
    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = qrCodeBase64
        link.download = `order-${orderId}-qr.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (!qrCodeBase64) {
        return null
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* QR Code Image */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition" />
                <div className="relative bg-white p-5 rounded-2xl shadow-2xl">
                    <img
                        src={qrCodeBase64}
                        alt={`QR Code for order ${orderId}`}
                        style={{ width: size, height: size }}
                        className="rounded-lg"
                    />
                </div>
            </div>

            {/* Order ID */}
            <div className="text-center">
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Order ID</p>
                <p className="text-sm font-bold text-white/70 font-mono bg-white/[0.04] border border-white/[0.06] px-4 py-2 rounded-lg mt-1">
                    {orderId.substring(0, 12)}...
                </p>
            </div>

            {/* Download Button */}
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transform hover:scale-105 transition-all"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code
            </button>
        </div>
    )
}

QRCodeDisplay.propTypes = {
    qrCodeBase64: PropTypes.string.isRequired,
    orderId: PropTypes.string.isRequired,
    size: PropTypes.number
}

export default QRCodeDisplay
