import axios from 'axios';

const API_URL = '/api/cart';

// Helper to get auth header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

const getCart = async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
    return response.data;
};

const addToCart = async (menuItemId, quantity = 1) => {
    const response = await axios.post(`${API_URL}/items`, {
        menuItemId,
        quantity
    }, { headers: getAuthHeader() });
    return response.data;
};

const updateCartItem = async (menuItemId, quantity) => {
    const response = await axios.put(`${API_URL}/items/${menuItemId}`, {
        quantity
    }, { headers: getAuthHeader() });
    return response.data;
};

const removeFromCart = async (menuItemId) => {
    const response = await axios.delete(`${API_URL}/items/${menuItemId}`, { 
        headers: getAuthHeader() 
    });
    return response.data;
};

const clearCart = async () => {
    const response = await axios.delete(API_URL, { headers: getAuthHeader() });
    return response.data;
};

export const cartService = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
