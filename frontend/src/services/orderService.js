import api from './api';

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
    }
};

export default orderService;
