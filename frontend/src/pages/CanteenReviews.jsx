import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import reviewService from '../services/reviewService'
import canteenService from '../services/canteenService'
import CanteenLayout from '../components/CanteenLayout'

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
                    const canteenData = await canteenService.getCanteenById(owner.canteenId)
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
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <CanteenLayout pageTitle="Customer Reviews" pageSubtitle="See what your customers are saying about your canteen">
            {/* Header Section */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-xl p-8 mb-8 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Overall Feedback</h2>
                        <p className="text-gray-400">
                            Total Reviews: <span className="font-bold text-gray-200">{reviews.length}</span>
                        </p>
                    </div>
                    {canteen && (
                        <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }} className="px-8 py-5 rounded-2xl text-center">
                            <p className="text-sm text-yellow-500 font-medium mb-1 uppercase tracking-wider">Average Rating</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-4xl font-extrabold text-yellow-400">
                                    {canteen.rating ? canteen.rating.toFixed(1) : '0.0'}
                                </span>
                                <svg className="w-8 h-8 text-yellow-400 fill-current drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                            </div>
                            <p className="text-xs text-yellow-600/70 mt-2 font-medium">Based on {canteen.totalRatings || 0} ratings</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }} className="text-center py-20 rounded-2xl shadow-lg mt-8">
                    <div className="bg-[rgba(255,255,255,0.03)] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500">Your canteen hasn't received any reviews yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {reviews.map((review) => (
                        <div key={review.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-lg p-6 hover:bg-[rgba(255,255,255,0.03)] transition duration-300">
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-200">{review.userName}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.05)]">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-4 h-4 mx-0.5 ${star <= review.rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-700'
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
                                <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid rgba(255,255,255,0.1)' }} className="p-4 rounded-r-lg rounded-b-lg mb-5">
                                    <p className="text-gray-400 italic text-sm leading-relaxed">"{review.comment}"</p>
                                </div>
                            )}

                            {review.orderItems && review.orderItems.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center border-t border-[rgba(255,255,255,0.05)] pt-4">
                                    <span className="text-xs uppercase font-bold text-gray-500 tracking-wider mr-1">Ordered:</span>
                                    {review.orderItems.map((item, idx) => (
                                        <span key={idx} style={{ background: 'rgba(255,255,255,0.05)' }} className="text-xs text-gray-300 px-2.5 py-1 rounded-full font-medium border border-[rgba(255,255,255,0.05)]">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </CanteenLayout>
    )
}

export default CanteenReviews
