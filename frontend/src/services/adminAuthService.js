import axios from 'axios'

const API_URL = 'http://localhost:8081/api/admin'


const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials)
    if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('adminUser', JSON.stringify(response.data))
    }
    return response.data
}

const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
}

const getCurrentAdmin = () => {
    const adminUser = localStorage.getItem('adminUser')
    return adminUser ? JSON.parse(adminUser) : null
}

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

const initializeAdmin = async () => {
    const response = await axios.post(`${API_URL}/init`)
    return response.data
}

export default {
    login,
    logout,
    getCurrentAdmin,
    getAuthHeader,
    initializeAdmin,
}
