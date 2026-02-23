import axios from 'axios'

const API_URL = '/api/staff'

const getAuthHeaders = () => {
    // Try canteen owner token first, then admin token
    const canteenOwner = JSON.parse(localStorage.getItem('canteenOwner'))
    if (canteenOwner?.token) {
        return { Authorization: `Bearer ${canteenOwner.token}` }
    }
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return { Authorization: `Bearer ${adminToken}` }
    }
    return {}
}

const staffService = {
    createStaff: async (staffData) => {
        const response = await axios.post(API_URL, staffData, { headers: getAuthHeaders() })
        return response.data
    },

    getStaffByCanteen: async (canteenId) => {
        const response = await axios.get(`${API_URL}/canteen/${canteenId}`, { headers: getAuthHeaders() })
        return response.data
    },

    getActiveStaffByCanteen: async (canteenId) => {
        const response = await axios.get(`${API_URL}/canteen/${canteenId}/active`, { headers: getAuthHeaders() })
        return response.data
    },

    getActiveStaffCount: async (canteenId) => {
        const response = await axios.get(`${API_URL}/canteen/${canteenId}/count`, { headers: getAuthHeaders() })
        return response.data
    },

    updateStaff: async (staffId, staffData) => {
        const response = await axios.put(`${API_URL}/${staffId}`, staffData, { headers: getAuthHeaders() })
        return response.data
    },

    updateStaffStatus: async (staffId, status) => {
        const response = await axios.patch(`${API_URL}/${staffId}/status?status=${status}`, {}, { headers: getAuthHeaders() })
        return response.data
    },

    deleteStaff: async (staffId) => {
        const response = await axios.delete(`${API_URL}/${staffId}`, { headers: getAuthHeaders() })
        return response.data
    }
}

export default staffService
