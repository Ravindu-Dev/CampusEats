import axios from 'axios';

const API_URL = '/api/canteen-auth/';

const register = async (canteenData) => {
    const response = await axios.post(API_URL + 'register', canteenData);
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

const canteenAuthService = {
    register,
    login,
    logout,
    getCurrentCanteenOwner,
};

export default canteenAuthService;
