import api from './api'
import axios from 'axios'

const reviewService = {
    // Create a new review (protected, uses api with interceptors)
    createReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData)
        return response.data
    },

    // Get current user's reviews (protected, uses api with interceptors)
    getMyReviews: async () => {
        const response = await api.get('/reviews/my-reviews')
        return response.data
    },

    // Get reviews for a specific canteen (public, uses plain axios)
    getCanteenReviews: async (canteenId) => {
        const response = await axios.get(`/api/reviews/canteen/${canteenId}`)
        return response.data
    },

    // Get all reviews (public, uses plain axios)
    getAllReviews: async () => {
        const response = await axios.get('/api/reviews')
        return response.data
    }
}

export default reviewService
