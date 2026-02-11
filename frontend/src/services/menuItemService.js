import axios from 'axios';

const API_URL = '/api/menu-items';

const getAuthHeaders = () => {
    const canteenOwner = JSON.parse(localStorage.getItem('canteenOwner'));
    return canteenOwner ? { Authorization: `Bearer ${canteenOwner.token}` } : {};
};

const getAllMenuItems = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getMenuItems = async (canteenId) => {
    const response = await axios.get(`${API_URL}/canteen/${canteenId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const createMenuItem = async (menuItem) => {
    const response = await axios.post(API_URL, menuItem, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateMenuItem = async (id, menuItem) => {
    const response = await axios.put(`${API_URL}/${id}`, menuItem, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const deleteMenuItem = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const menuItemService = {
    getAllMenuItems,
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
