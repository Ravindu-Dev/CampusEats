import axios from 'axios';
import notificationService from './notificationService';

const API_URL = '/api/auth/';

const signup = async (userData) => {
    const response = await axios.post(API_URL + 'signup', userData);
    return response.data;
};

const login = async (credentials) => {
    const response = await axios.post(API_URL + 'login', credentials);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));

        // Setup push notifications after login (non-blocking)
        notificationService.setupNotifications().then((success) => {
            if (success) {
                console.log('Push notifications enabled');
            }
        }).catch((error) => {
            console.warn('Push notification setup failed:', error);
        });
    }
    return response.data;
};

const logout = () => {
    // Unregister FCM token before logging out (non-blocking)
    notificationService.unregisterToken().catch(() => { });
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

