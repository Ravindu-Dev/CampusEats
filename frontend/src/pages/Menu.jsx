import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { menuItemService } from '../services/menuItemService'
import axios from 'axios'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages']

function Menu() {
    const [menuItems, setMenuItems] = useState([])
    const [canteens, setCanteens] = useState({})
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsData, canteensRes] = await Promise.all([
                    menuItemService.getAllMenuItems(),
                    axios.get('/api/canteens') // Assuming there's a public endpoint for all canteens
                ])
                
                setMenuItems(itemsData)
                
                // Create a map of canteenId -> canteenName
                const canteenMap = {}
                canteensRes.data.forEach(c => {
                    canteenMap[c.id] = c.canteenName
                })
                setCanteens(canteenMap)
                
                setLoading(false)
            } catch (err) {
                console.error('Error fetching menu data:', err)
                // Fallback: If canteens endpoint fails, just show items
                try {
                    const itemsData = await menuItemService.getAllMenuItems()
                    setMenuItems(itemsData)
                } catch (e) {
                    console.error('Second fetch failed:', e)
                }
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
        return matchesSearch && matchesCategory && item.available
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero / Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Our Food Menu
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Delicious meals from campus canteens, delivered to your doorstep.
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search for food..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-700"
                        />
                        <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 rounded-xl font-semibold transition-all shadow-md ${
                                    selectedCategory === cat
                                        ? 'bg-orange-600 text-white translate-y-[-2px]'
                                        : 'bg-white text-gray-600 hover:bg-orange-100 hover:text-orange-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold text-gray-900">No items found</h2>
                        <p className="text-gray-600">Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                                <div className="relative h-56 bg-gray-100 overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">
                                            🍕
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                                        <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                                    </div>
                                    {item.vegetarian && (
                                        <div className="absolute top-4 left-4 bg-green-500 text-white p-1 rounded-md shadow-md">
                                            <div className="border border-white p-0.5 rounded-sm">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">{item.category}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition truncate">{item.name}</h3>
                                        <p className="text-sm font-medium text-orange-500 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            {canteens[item.canteenId] || 'Campus Canteen'}
                                        </p>
                                    </div>
                                    <p className="text-gray-600 text-sm h-12 overflow-hidden mb-6 line-clamp-2">
                                        {item.description || 'No description available for this delicious item.'}
                                    </p>
                                    <button className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold shadow-lg transform active:scale-95 transition-all hover:shadow-orange-200">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Menu
