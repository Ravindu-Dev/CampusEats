import axios from 'axios'
import adminAuthService from './adminAuthService'

const API_URL = 'http://localhost:8081/api/admin/canteen-owners'

const getPendingRegistrations = async () => {
    const response = await axios.get(`${API_URL}/pending`, {
        headers: adminAuthService.getAuthHeader()
    })
    return response.data
}

const approveCanteenOwner = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/approve`, {}, {
        headers: adminAuthService.getAuthHeader()
    })
    return response.data
}

const rejectCanteenOwner = async (id, rejectionReason) => {
    const response = await axios.post(`${API_URL}/${id}/reject`, 
        { rejectionReason },
        {
            headers: adminAuthService.getAuthHeader()
        }
    )
    return response.data
}

const getAllCanteenOwners = async () => {
    const response = await axios.get(`${API_URL}/all`, {
        headers: adminAuthService.getAuthHeader()
    })
    return response.data
}

export default {
    getPendingRegistrations,
    approveCanteenOwner,
    rejectCanteenOwner,
    getAllCanteenOwners,
}
