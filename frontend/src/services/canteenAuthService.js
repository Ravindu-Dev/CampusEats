import axios from 'axios';

const API_URL = '/api/canteen-auth/';

const register = async (canteenData) => {
    const response = await axios.post(API_URL + 'register', canteenData);
    return response.data;
};

const checkEmail = async (email) => {
    const response = await axios.get(API_URL + 'check-email', { params: { email } });
    return response.data;
};

const login = async (credentials) => {
    const response = await axios.post(API_URL + 'login', credentials);
    if (response.data.token) {
        localStorage.setItem('canteenOwner', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('canteenOwner');
};

const getCurrentCanteenOwner = () => {
    return JSON.parse(localStorage.getItem('canteenOwner'));
};

const refreshToken = async () => {
    const owner = getCurrentCanteenOwner();
    if (!owner || !owner.token) {
        throw new Error('No token available');
    }
    const response = await axios.post(API_URL + 'refresh', {}, {
        headers: { Authorization: `Bearer ${owner.token}` },
    });
    if (response.data.token) {
        localStorage.setItem('canteenOwner', JSON.stringify(response.data));
    }
    return response.data;
};

const updateOwnerProfile = async (id, data) => {
    const owner = getCurrentCanteenOwner();
    const response = await axios.put(API_URL + 'owner/' + id, data, {
        headers: owner ? { Authorization: `Bearer ${owner.token}` } : {}
    });
    return response.data;
};

const canteenAuthService = {
    register,
    checkEmail,
    login,
    logout,
    getCurrentCanteenOwner,
    refreshToken,
    updateOwnerProfile,
};

export default canteenAuthService;
