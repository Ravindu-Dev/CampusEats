import api from './api';

const loyaltyService = {
    getAccount: async () => {
        const response = await api.get('/loyalty/account');
        return response.data;
    },

    redeemPoints: async (points) => {
        const response = await api.post('/loyalty/redeem', { points });
        return response.data;
    },

    getWeeklySpending: async () => {
        const response = await api.get('/loyalty/spending');
        return response.data;
    },
};

export default loyaltyService;
