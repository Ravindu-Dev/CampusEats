import { useState, useEffect } from 'react'
import reviewService from '../services/reviewService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Reviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRating, setFilterRating] = useState(0)

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            const data = await reviewService.getAllReviews()
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
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
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
            </div>
        )
    }

    // Filter reviews based on search and rating
    const filteredReviews = reviews.filter(review => {
        const matchesSearch = searchTerm === '' ||
            review.canteenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesRating = filterRating === 0 || review.rating === filterRating

        return matchesSearch && matchesRating
    })

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            {/* Header with Background */}
            <div className="relative bg-gray-900 py-20 mb-12">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                        alt="Reviews Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-50"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Community <span className="text-orange-600">Reviews</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                        Real experiences from students and staff. See what's trending on campus.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-20 relative z-10">
                {/* Search and Filter */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in-up">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Search Reviews</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by canteen, user, or comment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-orange-500 rounded-xl focus:ring-0 transition-all text-gray-900 font-medium"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Filter by Rating</label>
                            <div className="relative">
                                <select
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-orange-500 rounded-xl focus:ring-0 transition-all text-gray-900 font-medium appearance-none"
                                >
                                    <option value={0}>All Ratings</option>
                                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                                    <option value={2}>⭐⭐ 2 Stars</option>
                                    <option value={1}>⭐ 1 Star</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Reviews List */}
                {!loading && !error && (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                            {filteredReviews.length === 0 ? (
                                <div className="col-span-full bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100 animate-fade-in-up">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No reviews found</h2>
                                    <p className="text-gray-500">
                                        {searchTerm || filterRating ? 'Try adjusting your filters.' : 'Be the first to share your experience!'}
                                    </p>
                                </div>
                            ) : (
                                <div className="col-span-full space-y-6">
                                    <p className="text-gray-500 font-medium ml-1">
                                        Showing {filteredReviews.length} reviews
                                    </p>

                                    {filteredReviews.map((review, index) => (
                                        <div
                                            key={review.id}
                                            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden animate-fade-in-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex flex-col md:flex-row">
                                                {/* Left Rating Section */}
                                                <div className="bg-gray-50 p-6 md:w-64 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100">
                                                    <div className="text-5xl font-black text-gray-900 mb-2">{review.rating.toFixed(1)}</div>
                                                    <div className="mb-3">{renderStars(review.rating)}</div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Rating</div>
                                                </div>

                                                {/* Right Content Section */}
                                                <div className="p-6 md:p-8 flex-1">
                                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                                {review.canteenName}
                                                            </h3>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <span className="font-medium text-orange-600">{review.userName}</span>
                                                                <span className="mx-2">•</span>
                                                                <span>{formatDate(review.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Items Ordered Badges */}
                                                    {review.orderItems && review.orderItems.length > 0 && (
                                                        <div className="mb-6 flex flex-wrap gap-2">
                                                            {review.orderItems.map((item, i) => (
                                                                <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                                                                    {item}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Review Comment using blockquote style */}
                                                    {review.comment ? (
                                                        <div className="relative pl-4 border-l-4 border-gray-200">
                                                            <p className="text-gray-700 leading-relaxed italic text-lg">
                                                                "{review.comment}"
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-400 italic text-sm">No written review provided.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default Reviews
