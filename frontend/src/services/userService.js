import api from './api'

const userService = {
    getProfile: async () => {
        const response = await api.get('/user/profile')
        return response.data
    },

    updateProfile: async (data) => {
        const response = await api.put('/user/profile', data)
        return response.data
    },

    getFavorites: async () => {
        const response = await api.get('/user/profile/favorites')
        return response.data
    },

    addFavorite: async (itemId) => {
        const response = await api.post(`/user/profile/favorites/${itemId}`)
        return response.data
    },

    removeFavorite: async (itemId) => {
        const response = await api.delete(`/user/profile/favorites/${itemId}`)
        return response.data
    }
}

export default userService
