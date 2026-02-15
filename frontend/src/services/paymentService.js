import api from './api';

const paymentService = {
    createPaymentIntent: async (orderId, amount) => {
        const response = await api.post('/payment/create-intent', {
            orderId,
            amount
        });
        return response.data;
    },

    confirmPayment: async (paymentIntentId, orderIds) => {
        const response = await api.post('/payment/confirm', {
            paymentIntentId,
            orderIds
        });
        return response.data;
    }
};

export default paymentService;
