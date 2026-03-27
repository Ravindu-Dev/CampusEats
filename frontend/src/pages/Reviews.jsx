import { useState, useEffect, useRef } from 'react'
import reviewService from '../services/reviewService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Reviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRating, setFilterRating] = useState(0)
    const [lightboxImage, setLightboxImage] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 9
    const contentRef = useRef(null)

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

    const renderStars = (rating, size = 'w-3.5 h-3.5') => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`${size} ${star <= rating ? 'text-amber-400' : 'text-white/10'}`}
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

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = searchTerm === '' ||
            review.canteenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesRating = filterRating === 0 || review.rating === filterRating
        return matchesSearch && matchesRating
    })

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1) }, [searchTerm, filterRating])

    const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE)
    const paginatedReviews = filteredReviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const goToPage = (page) => {
        setCurrentPage(page)
        if (contentRef.current) {
            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

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
            <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-24">

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

                {/* Reviews grid */}
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
                            <>
                                <p className="text-gray-600 text-sm font-medium ml-1 mb-5">
                                    Showing <span className="text-orange-500 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredReviews.length)}</span> of <span className="text-white font-bold">{filteredReviews.length}</span> reviews
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {paginatedReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="group bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-orange-500/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col"
                                        >
                                            {/* Food Image */}
                                            {review.imageUrl && (
                                                <div
                                                    className="relative overflow-hidden cursor-pointer"
                                                    onClick={() => setLightboxImage(review.imageUrl)}
                                                >
                                                    <img
                                                        src={review.imageUrl}
                                                        alt="Food"
                                                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                        <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                        </svg>
                                                    </div>
                                                    {/* Rating badge overlay */}
                                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                        </svg>
                                                        <span className="text-white text-xs font-black">{review.rating}.0</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Card body */}
                                            <div className="p-5 flex flex-col flex-1">
                                                {/* Header: avatar + info + rating */}
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-orange-500/20">
                                                            {review.userName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-white font-bold text-sm truncate">{review.userName}</h3>
                                                            <p className="text-white/30 text-xs">{formatDate(review.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    {/* Rating — only show here if no image (image cards have overlay badge) */}
                                                    {!review.imageUrl && (
                                                        <div className="bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg flex items-center gap-1.5 flex-shrink-0">
                                                            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                            </svg>
                                                            <span className="text-white text-xs font-black">{review.rating}.0</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Canteen + Stars */}
                                                <div className="mb-3">
                                                    <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1.5">{review.canteenName}</p>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(review.rating)}
                                                        <span className="text-white/25 text-xs font-medium">{ratingLabels[review.rating]}</span>
                                                    </div>
                                                </div>

                                                {/* Order items */}
                                                {review.orderItems && review.orderItems.length > 0 && (
                                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                                        {review.orderItems.map((item, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] text-white/50 text-[11px] font-semibold rounded-md">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Comment */}
                                                <div className="flex-1">
                                                    {review.comment ? (
                                                        <p className="text-white/50 text-sm leading-relaxed line-clamp-3">
                                                            "{review.comment}"
                                                        </p>
                                                    ) : (
                                                        <p className="text-white/15 italic text-xs">No written review</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-10">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-xl text-sm font-bold bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            ← Prev
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                                    currentPage === page
                                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-900/30'
                                                        : 'bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-xl text-sm font-bold bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <Footer />

            {/* Image Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={lightboxImage}
                            alt="Food photo"
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                        />
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute -top-3 -right-3 w-10 h-10 bg-white/10 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Reviews
