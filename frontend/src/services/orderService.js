import api from './api';
import canteenAuthService from './canteenAuthService';

const orderService = {
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getUserOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    getOrderById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    getCanteenOrders: async (canteenId) => {
        const owner = canteenAuthService.getCurrentCanteenOwner();
        const token = owner?.token;
        const response = await api.get(`/orders/canteen/${canteenId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateOrderStatus: async (orderId, status, canteenId) => {
        const owner = canteenAuthService.getCurrentCanteenOwner();
        const token = owner?.token;
        const response = await api.patch(
            `/orders/${orderId}/status?canteenId=${canteenId}`,
            { status },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;
    },

    getOrderStatus: async (orderId) => {
        const response = await api.get(`/orders/${orderId}/status`);
        return response.data;
    }
};

export default orderService;
