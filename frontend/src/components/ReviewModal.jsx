import { useState } from 'react'
import PropTypes from 'prop-types'
import reviewService from '../services/reviewService'

function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (rating === 0) {
            setError('Please select a rating')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Get the canteen ID from the first order item
            const canteenId = order.orderItems[0]?.canteenId

            await reviewService.createReview({
                orderId: order.id,
                canteenId: canteenId,
                rating: rating,
                comment: comment.trim() || null
            })

            setSuccess(true)
            setLoading(false)
            setTimeout(() => {
                // Reset form state first
                setRating(0)
                setComment('')
                setSuccess(false)
                setError('')
                // Close modal
                onClose()
                // Then refresh orders list
                onReviewSubmitted()
            }, 1500)
        } catch (err) {
            console.error('Error submitting review:', err)
            const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Failed to submit review. Please try again.'
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setRating(0)
            setHoverRating(0)
            setComment('')
            setError('')
            setSuccess(false)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Write a Review
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Order Details
                        </h3>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Order ID:</span> {order.id.substring(0, 12)}...
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Canteen:</span> {order.orderItems[0]?.canteenName}
                            </p>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Items:</span>
                                <ul className="ml-4 mt-1 space-y-1">
                                    {order.orderItems.map((item, index) => (
                                        <li key={index} className="text-gray-700">
                                            • {item.name} x{item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Review submitted successfully!
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {/* Review Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Star Rating */}
                        <div className="mb-6">
                            <label className="block text-gray-900 font-semibold mb-3">
                                Your Rating <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none transform transition-transform hover:scale-110"
                                    >
                                        <svg
                                            className={`w-12 h-12 transition-colors ${star <= (hoverRating || rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                                }`}
                                            fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                            />
                                        </svg>
                                    </button>
                                ))}
                                {rating > 0 && (
                                    <span className="ml-3 text-lg font-semibold text-gray-700">
                                        {rating} {rating === 1 ? 'Star' : 'Stars'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-6">
                            <label className="block text-gray-900 font-semibold mb-2">
                                Your Review <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this order..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-black"
                                disabled={loading}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {comment.length}/500 characters
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || rating === 0}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

ReviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired,
    onReviewSubmitted: PropTypes.func.isRequired
}

export default ReviewModal
