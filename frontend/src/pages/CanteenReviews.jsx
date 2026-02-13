import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import reviewService from '../services/reviewService'
import canteenService from '../services/canteenService'

function CanteenReviews() {
    const [reviews, setReviews] = useState([])
    const [canteen, setCanteen] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) {
            navigate('/canteen/login')
            return
        }

        const fetchData = async () => {
            try {
                // Fetch reviews
                if (owner.canteenId) {
                    const reviewsData = await reviewService.getCanteenReviews(owner.canteenId)
                    setReviews(reviewsData)

                    // Fetch canteen details for header info
                    const canteenData = await canteenService.getMyCanteen(owner.canteenId)
                    setCanteen(canteenData)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">Loading reviews...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Navbar */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/canteen/dashboard" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                CampusEats
                            </span>
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">
                                Canteen Portal
                            </span>
                        </Link>
                        <Link
                            to="/canteen/dashboard"
                            className="text-gray-600 hover:text-orange-600 font-medium transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h1>
                            <p className="text-gray-600">
                                Total Reviews: <span className="font-bold text-gray-900">{reviews.length}</span>
                            </p>
                        </div>
                        {canteen && (
                            <div className="bg-yellow-50 px-6 py-4 rounded-xl text-center">
                                <p className="text-sm text-yellow-800 font-medium mb-1">Average Rating</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-4xl font-bold text-yellow-600">
                                        {canteen.rating ? canteen.rating.toFixed(1) : '0.0'}
                                    </span>
                                    <svg className="w-8 h-8 text-yellow-500 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">Based on {canteen.totalRatings || 0} ratings</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                        <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                        <p className="text-gray-600">Your canteen hasn't received any reviews yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {review.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{review.userName}</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex bg-yellow-50 px-3 py-1 rounded-lg">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-5 h-5 ${star <= review.rating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                    }`}
                                                fill={star <= review.rating ? 'currentColor' : 'none'}
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
                                    </div>
                                </div>

                                {review.comment && (
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <p className="text-gray-700 italic">"{review.comment}"</p>
                                    </div>
                                )}

                                {review.orderItems && review.orderItems.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Ordered:</span>
                                        {review.orderItems.map((item, idx) => (
                                            <span key={idx} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default CanteenReviews
