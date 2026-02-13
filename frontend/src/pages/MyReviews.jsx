import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import reviewService from '../services/reviewService'
import Navbar from '../components/Navbar'

function MyReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            const data = await reviewService.getMyReviews()
            setReviews(data)
        } catch (err) {
            console.error('Error fetching reviews:', err)
            setError('Failed to load reviews')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const renderStars = (rating) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                        fill={star <= rating ? 'currentColor' : 'none'}
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
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-700">{rating}/5</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/dashboard" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                        <svg className="w-10 h-10 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        My Reviews
                    </h1>
                    <p className="text-gray-600 mt-2">Your complete rating history</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Reviews List */}
                {!loading && !error && (
                    <>
                        {reviews.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">No reviews yet</h2>
                                <p className="text-gray-600 mb-8 text-lg">Complete an order and share your experience!</p>
                                <Link
                                    to="/orders"
                                    className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold shadow-lg"
                                >
                                    View Orders
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                                        {/* Review Header */}
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold">{review.canteenName}</h3>
                                                    <p className="text-sm opacity-90 mt-1">{formatDate(review.createdAt)}</p>
                                                </div>
                                                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Review Content */}
                                        <div className="p-6">
                                            {/* Items Ordered */}
                                            {review.orderItems && review.orderItems.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                        </svg>
                                                        Items Ordered:
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {review.orderItems.map((item, index) => (
                                                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Review Comment */}
                                            {review.comment && (
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Your Review:</h4>
                                                    <p className="text-gray-800 leading-relaxed">{review.comment}</p>
                                                </div>
                                            )}

                                            {!review.comment && (
                                                <p className="text-gray-500 italic">No written review provided</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default MyReviews
