import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const qrService = {
    /**
     * Verify a scanned QR code
     * @param {string} scannedData - The order ID from the QR code
     * @param {string} canteenId - The canteen ID to verify against
     * @returns {Promise} Order details if valid
     */
    verifyQRCode: async (scannedData, canteenId) => {
        const canteenOwner = JSON.parse(localStorage.getItem('canteenOwner'));
        const token = canteenOwner?.token;

        if (!token) {
            throw new Error('Not authenticated. Please log in again.');
        }

        const response = await axios.post(
            `${API_URL}/orders/verify-qr`,
            { scannedData, canteenId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }
};

export default qrService;
