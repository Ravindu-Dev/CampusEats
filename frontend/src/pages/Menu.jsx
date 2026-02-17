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
    const [queueStatuses, setQueueStatuses] = useState({}) // canteenId -> queue status data
    const [loading, setLoading] = useState(true)
    const [addingToCart, setAddingToCart] = useState({}) // item.id -> loadingState
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedRestaurant, setSelectedRestaurant] = useState(null) // null = all restaurants
    const scrollContainerRef = useRef(null)

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            })
        }
    }

    const handleAddToCart = async (item) => {
        if (!user) {
            // Show message or just redirect
            alert('Please login to add items to cart')
            navigate('/login')
            return
        }

        try {
            setAddingToCart(prev => ({ ...prev, [item.id]: true }))
            const success = await addToCart(item.id, 1)
            if (success) {
                // Success feedback is handled by CartContext opening the cart
            }
        } finally {
            setAddingToCart(prev => ({ ...prev, [item.id]: false }))
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all canteens first to build the filter bar
                let canteenData = []
                try {
                    const response = await axios.get('/api/canteens')
                    canteenData = response.data
                } catch (canteenError) {
                    console.error('Error fetching all canteens:', canteenError)
                    // Fallback: will try to build from menu items later
                }

                // Fetch menu items
                const itemsData = await menuItemService.getAllMenuItems()
                setMenuItems(itemsData)

                // Fetch queue status
                try {
                    const queueData = await canteenService.getQueueStatus()
                    const queueMap = {}
                    queueData.forEach(q => {
                        queueMap[q.canteenId] = q
                    })
                    setQueueStatuses(queueMap)
                } catch (queueError) {
                    console.error('Error fetching queue status:', queueError)
                    // Continue without queue status if it fails
                }

                // Build canteen map
                const canteenMap = {}

                // If we got canteen data from API, use it
                if (canteenData && canteenData.length > 0) {
                    canteenData.forEach(c => {
                        canteenMap[c.id] = c
                    })
                }

                // Ensure canteens from menu items are also in the map (just in case)
                const uniqueCanteenIds = [...new Set(itemsData.map(item => item.canteenId).filter(Boolean))]
                await Promise.all(
                    uniqueCanteenIds.map(async (canteenId) => {
                        if (!canteenMap[canteenId]) {
                            try {
                                const response = await axios.get(`/api/canteens/${canteenId}`)
                                canteenMap[canteenId] = response.data
                            } catch (error) {
                                console.error(`Error fetching canteen ${canteenId}:`, error)
                                canteenMap[canteenId] = {
                                    id: canteenId,
                                    canteenName: `Canteen ${canteenId.substring(0, 4)}`,
                                    status: 'APPROVED',
                                    active: true
                                }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <div className="relative bg-gray-900 py-24 sm:py-32">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
                        alt="Menu Background"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
                        Discover & <span className="text-orange-500">Devour</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        Explore a world of flavors from your campus canteens. Fresh, hot, and ready when you are.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-20">
                {/* Restaurant Filter Bar */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-4">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h2 className="text-xl font-bold text-gray-900">Browse by Restaurant</h2>
                    </div>

                    <div className="relative group/scroll">
                        {/* Navigation Buttons */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-all opacity-0 group-hover/scroll:opacity-100 focus:opacity-100"
                            aria-label="Scroll left"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-all opacity-0 group-hover/scroll:opacity-100 focus:opacity-100"
                            aria-label="Scroll right"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Scroll container */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {/* All Restaurants Option */}
                            <button
                                onClick={() => setSelectedRestaurant(null)}
                                className={`flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-2xl transition-all transform hover:scale-105 snap-start ${!selectedRestaurant
                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 ring-4 ring-orange-200'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                    }`}
                                style={{ minWidth: '140px' }}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${!selectedRestaurant ? 'bg-white/20' : 'bg-white'
                                    }`}>
                                    🍽️
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-sm">All Restaurants</p>
                                    <p className={`text-xs mt-1 ${!selectedRestaurant ? 'text-orange-100' : 'text-gray-500'}`}>
                                        {menuItems.filter(item => item.available).length} items
                                    </p>
                                </div>
                            </button>

                            {/* Individual Restaurants */}
                            {Object.values(canteens)
                                .filter(canteen => canteen.active)
                                .map(canteen => {
                                    const itemCount = menuItems.filter(item => item.canteenId === canteen.id && item.available).length
                                    const isSelected = selectedRestaurant === canteen.id
                                    const queueInfo = queueStatuses[canteen.id]

                                    // Queue badge configuration
                                    const getQueueBadge = () => {
                                        if (!queueInfo || queueInfo.queueStatus === 'NONE') return null

                                        const configs = {
                                            HIGH: {
                                                emoji: '🔥',
                                                text: 'High Queue',
                                                bgClass: 'bg-red-500',
                                                textClass: 'text-white'
                                            },
                                            MEDIUM: {
                                                emoji: '⚡',
                                                text: 'Medium Queue',
                                                bgClass: 'bg-yellow-500',
                                                textClass: 'text-white'
                                            },
                                            LOW: {
                                                emoji: '✓',
                                                text: 'Low Queue',
                                                bgClass: 'bg-green-500',
                                                textClass: 'text-white'
                                            }
                                        }

                                        return configs[queueInfo.queueStatus]
                                    }

                                    const queueBadge = getQueueBadge()

                                    return (
                                        <button
                                            key={canteen.id}
                                            onClick={() => setSelectedRestaurant(canteen.id)}
                                            className={`relative flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-2xl transition-all transform hover:scale-105 snap-start ${isSelected
                                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 ring-4 ring-orange-200'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                }`}
                                            style={{ minWidth: '140px' }}
                                        >
                                            {/* Queue Badge */}
                                            {queueBadge && (
                                                <div className={`absolute -top-2 -right-2 ${queueBadge.bgClass} ${queueBadge.textClass} px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1 animate-pulse`}>
                                                    <span>{queueBadge.emoji}</span>
                                                    <span className="hidden sm:inline">{queueBadge.text}</span>
                                                </div>
                                            )}

                                            <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center ${isSelected ? 'ring-4 ring-white/30' : 'ring-2 ring-gray-200'
                                                }`}>
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
                                                    <div className={`w-full h-full flex items-center justify-center text-3xl ${isSelected ? 'bg-white/20' : 'bg-white'
                                                        }`}>
                                                        🏪
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-sm line-clamp-1" title={canteen.canteenName}>
                                                    {canteen.canteenName}
                                                </p>
                                                <p className={`text-xs mt-1 ${isSelected ? 'text-orange-100' : 'text-gray-500'}`}>
                                                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                </p>
                                                {canteen.rating > 0 && (
                                                    <div className={`flex items-center justify-center gap-1 mt-1 ${isSelected ? 'text-yellow-200' : 'text-yellow-500'
                                                        }`}>
                                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-xs font-bold">{canteen.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-12 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-96 group">
                            <input
                                type="text"
                                placeholder="Search for food..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all outline-none text-gray-700 font-medium group-hover:bg-white group-hover:shadow-md"
                            />
                            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4 transition-colors group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${selectedCategory === cat
                                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 ring-2 ring-orange-600 ring-offset-2'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up">
                        <div className="text-6xl mb-6 opacity-80">🍳</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">No items found</h2>
                        <p className="text-gray-500 text-lg">We couldn't find matches for your search. Try "Pizza" or "Coffee".</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredItems.map((item, index) => {
                            const canteen = canteens[item.canteenId]
                            return (
                                <div
                                    key={item.id}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="relative h-60 overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-6xl opacity-20">
                                                🍽️
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg">
                                            <span className="text-lg font-black text-gray-900">₹{item.price}</span>
                                        </div>
                                        {item.vegetarian && (
                                            <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm p-1.5 rounded-lg shadow-lg">
                                                <div className="border border-white p-0.5 rounded-sm">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4">
                                            <span className="inline-block px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1" title={item.name}>
                                                    {item.name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span className="font-medium truncate max-w-[120px]" title={canteen ? canteen.canteenName : 'Campus Canteen'}>
                                                        {canteen ? canteen.canteenName : 'Campus Canteen'}
                                                    </span>
                                                </div>

                                                {canteen && canteen.rating > 0 && (
                                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                                                        <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="font-bold text-gray-800 text-xs">{canteen.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-gray-500 text-sm line-clamp-2 h-10 leading-relaxed mb-4">
                                                {item.description || 'A delicious choice for your meal today.'}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={addingToCart[item.id]}
                                            className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-95 ${addingToCart[item.id]
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-900 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200'
                                                }`}
                                        >
                                            {addingToCart[item.id] ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
