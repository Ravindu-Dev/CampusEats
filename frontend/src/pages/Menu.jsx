import { useState, useEffect, useContext, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { menuItemService } from '../services/menuItemService'
import canteenService from '../services/canteenService'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages']

function Menu() {
    const { user } = useContext(AuthContext)
    const { addToCart } = useCart()
    const navigate = useNavigate()
    const [menuItems, setMenuItems] = useState([])
    const [canteens, setCanteens] = useState({})
    const [queueStatuses, setQueueStatuses] = useState({})
    const [loading, setLoading] = useState(true)
    const [addingToCart, setAddingToCart] = useState({})
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)
    const scrollContainerRef = useRef(null)

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
                behavior: 'smooth'
            })
        }
    }

    const handleAddToCart = async (item) => {
        if (!user) {
            alert('Please login to add items to cart')
            navigate('/login')
            return
        }
        try {
            setAddingToCart(prev => ({ ...prev, [item.id]: true }))
            await addToCart(item.id, 1)
        } finally {
            setAddingToCart(prev => ({ ...prev, [item.id]: false }))
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                let canteenData = []
                try {
                    const response = await axios.get('/api/canteens')
                    canteenData = response.data
                } catch (canteenError) {
                    console.error('Error fetching all canteens:', canteenError)
                }

                const itemsData = await menuItemService.getAllMenuItems()
                setMenuItems(itemsData)

                try {
                    const queueData = await canteenService.getQueueStatus()
                    const queueMap = {}
                    queueData.forEach(q => { queueMap[q.canteenId] = q })
                    setQueueStatuses(queueMap)
                } catch (queueError) {
                    console.error('Error fetching queue status:', queueError)
                }

                const canteenMap = {}
                if (canteenData && canteenData.length > 0) {
                    canteenData.forEach(c => { canteenMap[c.id] = c })
                }

                const uniqueCanteenIds = [...new Set(itemsData.map(item => item.canteenId).filter(Boolean))]
                await Promise.all(
                    uniqueCanteenIds.map(async (canteenId) => {
                        if (!canteenMap[canteenId]) {
                            try {
                                const response = await axios.get(`/api/canteens/${canteenId}`)
                                canteenMap[canteenId] = response.data
                            } catch (error) {
                                canteenMap[canteenId] = { id: canteenId, canteenName: `Canteen ${canteenId.substring(0, 4)}`, status: 'APPROVED', active: true }
                            }
                        }
                    })
                )

                setCanteens(canteenMap)
                setLoading(false)
            } catch (err) {
                console.error('Error fetching menu data:', err)
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
        const matchesRestaurant = !selectedRestaurant || item.canteenId === selectedRestaurant
        return matchesSearch && matchesCategory && matchesRestaurant && item.available
    })

    /* ── Queue badge helper ── */
    const getQueueBadge = (canteenId) => {
        const queueInfo = queueStatuses[canteenId]
        if (!queueInfo || queueInfo.queueStatus === 'NONE') return null
        const configs = {
            HIGH: { emoji: '🔥', text: 'High Queue', bg: 'bg-red-500' },
            MEDIUM: { emoji: '⚡', text: 'Medium Queue', bg: 'bg-yellow-500' },
            LOW: { emoji: '✓', text: 'Low Queue', bg: 'bg-green-500' },
        }
        return configs[queueInfo.queueStatus] ?? null
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Loading Menu…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#080808] font-sans text-white">
            <Navbar />

            {/* ── Hero banner ── */}
            <div className="relative pt-20 pb-28 overflow-hidden">
                {/* Bg image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
                        alt="Menu Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/60 via-[#080808]/70 to-[#080808]" />
                </div>

                {/* Glow dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
                    <span className="inline-flex items-center gap-2 bg-orange-600/15 border border-orange-500/30 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span className="text-orange-300 text-xs font-bold tracking-widest uppercase">Campus Canteens</span>
                    </span>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-4">
                        Discover &amp; <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 bg-clip-text text-transparent">Devour</span>
                    </h1>
                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto font-light italic">
                        Fresh, hot, and ready when you are.
                    </p>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-24">

                {/* ── Canteen filter bar ── */}
                <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6 mb-5 shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-white tracking-wide">Browse by Restaurant</h2>
                    </div>

                    <div className="relative group/scroll">
                        {/* Scroll buttons */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-20 w-9 h-9 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all opacity-0 group-hover/scroll:opacity-100"
                            aria-label="Scroll left"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-20 w-9 h-9 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all opacity-0 group-hover/scroll:opacity-100"
                            aria-label="Scroll right"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Canteen chips */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {/* All */}
                            <button
                                onClick={() => setSelectedRestaurant(null)}
                                className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl transition-all snap-start ${!selectedRestaurant
                                    ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-[0_4px_20px_rgba(234,88,12,0.35)]'
                                    : 'bg-white/[0.05] border border-white/[0.07] text-gray-400 hover:border-orange-500/30 hover:text-white'
                                    }`}
                                style={{ minWidth: '130px' }}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${!selectedRestaurant ? 'bg-white/20' : 'bg-white/5'}`}>
                                    🍽️
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-xs">All Restaurants</p>
                                    <p className={`text-xs mt-0.5 ${!selectedRestaurant ? 'text-orange-100' : 'text-gray-600'}`}>
                                        {menuItems.filter(i => i.available).length} items
                                    </p>
                                </div>
                            </button>

                            {/* Individual canteens */}
                            {Object.values(canteens)
                                .filter(canteen => canteen.active)
                                .map(canteen => {
                                    const itemCount = menuItems.filter(i => i.canteenId === canteen.id && i.available).length
                                    const isSelected = selectedRestaurant === canteen.id
                                    const queueBadge = getQueueBadge(canteen.id)

                                    return (
                                        <button
                                            key={canteen.id}
                                            onClick={() => setSelectedRestaurant(canteen.id)}
                                            className={`relative flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl transition-all snap-start ${isSelected
                                                ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-[0_4px_20px_rgba(234,88,12,0.35)]'
                                                : 'bg-white/[0.05] border border-white/[0.07] text-gray-400 hover:border-orange-500/30 hover:text-white'
                                                }`}
                                            style={{ minWidth: '130px' }}
                                        >
                                            {/* Queue badge — inside chip top-right so scroll container never clips it */}
                                            {queueBadge && (
                                                <div className={`absolute top-2 right-2 ${queueBadge.bg} text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1`}>
                                                    <span>{queueBadge.emoji}</span>
                                                    <span>{queueBadge.text}</span>
                                                </div>
                                            )}

                                            <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center ${isSelected ? 'ring-2 ring-white/40' : 'ring-1 ring-white/[0.08]'}`}>
                                                {canteen.logoUrl ? (
                                                    <img
                                                        src={canteen.logoUrl}
                                                        alt={canteen.canteenName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="50" font-size="40" text-anchor="middle" x="50"%3E🏪%3C/text%3E%3C/svg%3E'
                                                        }}
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center text-2xl ${isSelected ? 'bg-white/20' : 'bg-white/5'}`}>
                                                        🏪
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-center">
                                                <p className="font-bold text-xs line-clamp-1" title={canteen.canteenName}>{canteen.canteenName}</p>
                                                <p className={`text-xs mt-0.5 ${isSelected ? 'text-orange-100' : 'text-gray-600'}`}>
                                                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                </p>
                                                {canteen.rating > 0 && (
                                                    <div className={`flex items-center justify-center gap-1 mt-1 ${isSelected ? 'text-yellow-200' : 'text-yellow-500'}`}>
                                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-[10px] font-bold">{canteen.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                        </div>
                    </div>
                </div>

                {/* ── Search & category filter ── */}
                <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-4 md:p-5 mb-10 shadow-xl">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-96 group">
                            <svg className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search for food…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-orange-500/60 focus:bg-white/[0.08] transition-all outline-none text-white placeholder-gray-600 font-medium"
                            />
                        </div>

                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${selectedCategory === cat
                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.35)]'
                                        : 'bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:border-orange-500/30 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Results count ── */}
                {filteredItems.length > 0 && (
                    <p className="text-gray-600 text-sm font-medium mb-6">
                        Showing <span className="text-orange-500 font-bold">{filteredItems.length}</span> {filteredItems.length === 1 ? 'item' : 'items'}
                        {selectedCategory !== 'All' && <span> in <span className="text-white">{selectedCategory}</span></span>}
                    </p>
                )}

                {/* ── Menu grid ── */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-32 bg-[#111] border border-white/[0.07] rounded-3xl">
                        <div className="text-6xl mb-6 opacity-60">🍳</div>
                        <h2 className="text-3xl font-black text-white mb-3">No items found</h2>
                        <p className="text-gray-500 text-lg">We couldn't find matches for your search. Try "Rice" or "Coffee".</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item, index) => {
                            const canteen = canteens[item.canteenId]
                            return (
                                <div
                                    key={item.id}
                                    className="group bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-orange-500/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300"
                                    style={{ animationDelay: `${index * 40}ms` }}
                                >
                                    {/* Image */}
                                    <div className="relative h-52 overflow-hidden">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-5xl opacity-20">
                                                🍽️
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                        {/* Price badge */}
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                                            <span className="text-sm font-black text-white">Rs.{item.price}</span>
                                        </div>

                                        {/* Veg badge */}
                                        {item.vegetarian && (
                                            <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm p-1.5 rounded-lg">
                                                <div className="border border-white p-0.5 rounded-sm">
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Category badge */}
                                        <div className="absolute bottom-3 left-3">
                                            <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-bold text-white/80 uppercase tracking-widest border border-white/10">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <h3 className="text-base font-black text-white leading-tight group-hover:text-orange-300 transition-colors line-clamp-1 mb-1" title={item.name}>
                                            {item.name}
                                        </h3>

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <svg className="w-3.5 h-3.5 text-orange-500/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="text-xs font-medium truncate max-w-[120px]" title={canteen?.canteenName ?? 'Campus Canteen'}>
                                                    {canteen?.canteenName ?? 'Campus Canteen'}
                                                </span>
                                            </div>

                                            {canteen?.rating > 0 && (
                                                <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">
                                                    <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span className="text-[10px] font-bold text-yellow-400">{canteen.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 h-8 mb-4">
                                            {item.description || 'A delicious choice for your meal today.'}
                                        </p>

                                        {/* Add to cart button */}
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={addingToCart[item.id]}
                                            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${addingToCart[item.id]
                                                ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-[0_0_25px_rgba(234,88,12,0.4)] hover:scale-[1.02] active:scale-95'
                                                }`}
                                        >
                                            {addingToCart[item.id] ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                                                    Adding…
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add to Cart
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default Menu
