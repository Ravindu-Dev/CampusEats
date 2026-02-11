import axios from 'axios'
import adminAuthService from './adminAuthService'

const API_URL = 'http://localhost:8081/api/admin/canteens'

const getAllCanteens = async () => {
    const response = await axios.get(API_URL, {
        headers: adminAuthService.getAuthHeader()
    })
    return response.data
}

export default {
    getAllCanteens,
}
