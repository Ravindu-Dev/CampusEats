import api from './api';

const API_URL = '/users/';

const getUserProfile = async () => {
    const response = await api.get(API_URL + 'profile');
    return response.data;
};

const updateUserProfile = async (profileData) => {
    const response = await api.put(API_URL + 'profile', profileData);
    return response.data;
};

const userService = {
    getUserProfile,
    updateUserProfile,
};

export default userService;
