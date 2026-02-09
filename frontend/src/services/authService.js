import axios from 'axios';

const API_URL = '/api/auth/';

const signup = async (userData) => {
    const response = await axios.post(API_URL + 'signup', userData);
    return response.data;
};

const login = async (credentials) => {
    const response = await axios.post(API_URL + 'login', credentials);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    signup,
    login,
    logout,
    getCurrentUser,
};

export default authService;
