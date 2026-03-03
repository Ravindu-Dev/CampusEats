import api from './api'

const userService = {
    getProfile: async () => {
        const response = await api.get('/user/profile')
        return response.data
    },

    updateProfile: async (data) => {
        const response = await api.put('/user/profile', data)
        return response.data
    }
}

export default userService
