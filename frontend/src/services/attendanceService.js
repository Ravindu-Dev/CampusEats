import axios from 'axios'

const API_URL = '/api/attendance'

const getAuthHeaders = () => {
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

const attendanceService = {
    logAttendance: async (data) => {
        const response = await axios.post(API_URL, data, { headers: getAuthHeaders() })
        return response.data
    },

    logBulkAttendance: async (data) => {
        const response = await axios.post(`${API_URL}/bulk`, data, { headers: getAuthHeaders() })
        return response.data
    },

    getAttendanceByCanteen: async (canteenId, startDate, endDate) => {
        const response = await axios.get(`${API_URL}/canteen/${canteenId}?startDate=${startDate}&endDate=${endDate}`, { headers: getAuthHeaders() })
        return response.data
    },

    getAttendanceByCanteenAndDate: async (canteenId, date) => {
        const response = await axios.get(`${API_URL}/canteen/${canteenId}/date/${date}`, { headers: getAuthHeaders() })
        return response.data
    },

    getAttendanceByStaff: async (staffId, startDate, endDate) => {
        const response = await axios.get(`${API_URL}/staff/${staffId}?startDate=${startDate}&endDate=${endDate}`, { headers: getAuthHeaders() })
        return response.data
    }
}

export default attendanceService
