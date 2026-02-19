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

    useEffect(() => { fetchReviews() }, [])

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
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-white/10'}`}
                    fill={star <= rating ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                </svg>
            ))}
        </div>
    )

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = searchTerm === '' ||
            review.canteenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesRating = filterRating === 0 || review.rating === filterRating
        return matchesSearch && matchesRating
    })

    return (
        <div className="min-h-screen bg-[#080808] font-sans text-white">
            <Navbar />

            {/* ── Hero ── */}
            <div className="relative pt-20 pb-28 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                        alt="Reviews Background"
                        className="w-full h-full object-cover opacity-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/60 via-[#080808]/75 to-[#080808]" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
                    <span className="inline-flex items-center gap-2 bg-orange-600/15 border border-orange-500/30 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span className="text-orange-300 text-xs font-bold tracking-widest uppercase">Student Voices</span>
                    </span>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-4">
                        Community <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 bg-clip-text text-transparent">Reviews</span>
                    </h1>
                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto font-light italic">
                        Real experiences from students and staff. See what's trending on campus.
                    </p>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-24">

                {/* Search & filter */}
                <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6 mb-8 shadow-xl">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Search */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Search Reviews</label>
                            <div className="relative">
                                <svg className="w-5 h-5 text-gray-600 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by canteen, user, or comment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] focus:border-orange-500/60 rounded-xl outline-none text-white placeholder-gray-600 font-medium transition-all"
                                />
                            </div>
                        </div>

                        {/* Rating filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Filter by Rating</label>
                            <div className="relative">
                                <select
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] focus:border-orange-500/60 rounded-xl outline-none text-white font-medium appearance-none transition-all"
                                    style={{ colorScheme: 'dark', backgroundColor: '#1a1a1a' }}
                                >
                                    <option className="bg-[#1a1a1a] text-white" value={0}>All Ratings</option>
                                    <option className="bg-[#1a1a1a] text-white" value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                                    <option className="bg-[#1a1a1a] text-white" value={4}>⭐⭐⭐⭐ 4 Stars</option>
                                    <option className="bg-[#1a1a1a] text-white" value={3}>⭐⭐⭐ 3 Stars</option>
                                    <option className="bg-[#1a1a1a] text-white" value={2}>⭐⭐ 2 Stars</option>
                                    <option className="bg-[#1a1a1a] text-white" value={1}>⭐ 1 Star</option>
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

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-24">
                        <div className="w-14 h-14 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl mb-6">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Reviews list */}
                {!loading && !error && (
                    <>
                        {filteredReviews.length === 0 ? (
                            <div className="bg-[#111] border border-white/[0.07] rounded-3xl p-16 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6">
                                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">No reviews found</h2>
                                <p className="text-gray-600">
                                    {searchTerm || filterRating ? 'Try adjusting your filters.' : 'Be the first to share your experience!'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <p className="text-gray-600 text-sm font-medium ml-1">
                                    Showing <span className="text-orange-500 font-bold">{filteredReviews.length}</span> reviews
                                </p>

                                {filteredReviews.map((review, index) => (
                                    <div
                                        key={review.id}
                                        className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-orange-500/25 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {/* Left — rating panel */}
                                            <div className="bg-[#1a1a1a] p-6 md:w-56 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-white/[0.06]">
                                                <div className="text-5xl font-black text-white mb-2">{review.rating.toFixed(1)}</div>
                                                <div className="mb-3">{renderStars(review.rating)}</div>
                                                <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">Overall Rating</div>
                                            </div>

                                            {/* Right — content */}
                                            <div className="p-6 md:p-8 flex-1">
                                                <div className="mb-4">
                                                    <h3 className="text-xl font-black text-white mb-1">{review.canteenName}</h3>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <span className="font-bold text-orange-500">{review.userName}</span>
                                                        <span className="mx-2 text-gray-700">•</span>
                                                        <span>{formatDate(review.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Order items */}
                                                {review.orderItems && review.orderItems.length > 0 && (
                                                    <div className="mb-5 flex flex-wrap gap-2">
                                                        {review.orderItems.map((item, i) => (
                                                            <span key={i} className="px-3 py-1 bg-orange-500/15 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Comment */}
                                                {review.comment ? (
                                                    <div className="relative pl-4 border-l-4 border-orange-600/40">
                                                        <p className="text-gray-300 leading-relaxed italic text-base">
                                                            "{review.comment}"
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-700 italic text-sm">No written review provided.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default Reviews
