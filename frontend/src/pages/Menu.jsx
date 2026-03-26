import { useState, useEffect, useContext, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { menuItemService } from '../services/menuItemService'
import canteenService from '../services/canteenService'
import comboDealService from '../services/comboDealService'
import loyaltyService from '../services/loyaltyService'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages']

const SCROLLBAR_STYLE = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(249, 115, 22, 0.3);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(249, 115, 22, 0.6);
  }
`

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
    const recommendedScrollRef = useRef(null)
    const allCombosScrollRef = useRef(null)

    // Combo deals & loyalty state
    const [recommendedCombos, setRecommendedCombos] = useState([])
    const [allCombos, setAllCombos] = useState([])
    const [loyaltyAccount, setLoyaltyAccount] = useState(null)
    const [addingCombo, setAddingCombo] = useState({})
    const [showLoyaltyBadge, setShowLoyaltyBadge] = useState(false)
    const [selectedCombo, setSelectedCombo] = useState(null)
    const [selectedItem, setSelectedItem] = useState(null)

    const TIER_CONFIG = {
        BRONZE: { color: '#CD7F32', bg: 'rgba(205,127,50,0.15)', border: 'rgba(205,127,50,0.3)', icon: '🥉' },
        SILVER: { color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)', border: 'rgba(192,192,192,0.3)', icon: '🥈' },
        GOLD: { color: '#FFD700', bg: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.3)', icon: '🥇' },
        PLATINUM: { color: '#E5E4E2', bg: 'rgba(229,228,226,0.2)', border: 'rgba(229,228,226,0.4)', icon: '💎' },
    }

    const scroll = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = 300
            ref.current.scrollTo({
                left: ref.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
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

    const handleAddComboToCart = async (combo) => {
        if (!user) {
            alert('Please login to add combo deals to cart')
            navigate('/login')
            return
        }
        try {
            setAddingCombo(prev => ({ ...prev, [combo.id]: true }))
            for (const item of combo.items) {
                await addToCart(item.menuItemId, item.quantity)
            }
        } finally {
            setAddingCombo(prev => ({ ...prev, [combo.id]: false }))
        }
    }

    useEffect(() => {
        // Inject custom scrollbar style
        const styleTag = document.createElement('style')
        styleTag.innerHTML = SCROLLBAR_STYLE
        document.head.appendChild(styleTag)

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

                // Fetch all active combo deals (public)
                try {
                    const combos = await comboDealService.getAllActiveComboDeals()
                    setAllCombos(combos)
                } catch (err) {
                    console.error('Error fetching combo deals:', err)
                }

                // Fetch personalized recommendations and loyalty (if logged in)
                if (user) {
                    try {
                        const [recCombos, loyalty] = await Promise.all([
                            comboDealService.getRecommendedCombos(),
                            loyaltyService.getAccount()
                        ])
                        setRecommendedCombos(recCombos)
                        setLoyaltyAccount(loyalty)
                    } catch (err) {
                        console.error('Error fetching recommendations/loyalty:', err)
                    }
                }

                setLoading(false)
            } catch (err) {
                console.error('Error fetching menu data:', err)
                setLoading(false)
            }
        }
        fetchData()

        return () => {
            document.head.removeChild(styleTag)
        }
    }, [user])

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
        const matchesRestaurant = !selectedRestaurant || item.canteenId === selectedRestaurant
        return matchesSearch && matchesCategory && matchesRestaurant && item.available
    })

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

    const tierConfig = loyaltyAccount ? TIER_CONFIG[loyaltyAccount.tier] || TIER_CONFIG.BRONZE : null

    return (
        <div className="min-h-screen bg-[#080808] font-sans text-white">
            <Navbar />

            {/* Loyalty Points Floating Badge */}
            {user && loyaltyAccount && tierConfig && (
                <div className="fixed bottom-6 left-6 z-50 cursor-pointer" onClick={() => setShowLoyaltyBadge(!showLoyaltyBadge)}>
                    {showLoyaltyBadge ? (
                        <div style={{ background: 'rgba(15,15,15,0.95)', border: `1px solid ${tierConfig.border}`, backdropFilter: 'blur(20px)' }} className="rounded-2xl p-5 shadow-2xl w-72">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{tierConfig.icon}</span>
                                    <span style={{ color: tierConfig.color }} className="text-sm font-black uppercase tracking-wider">{loyaltyAccount.tier}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setShowLoyaltyBadge(false) }} className="text-gray-500 hover:text-white text-lg">✕</button>
                            </div>
                            <div className="text-3xl font-black text-white mb-1">{loyaltyAccount.totalPoints} <span className="text-sm font-medium text-gray-500">points</span></div>
                            <div className="text-xs text-gray-500 mb-3">Lifetime: {loyaltyAccount.lifetimePoints} points</div>
                            {loyaltyAccount.nextTier && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Next: {loyaltyAccount.nextTier}</span>
                                        <span className="text-gray-400">{loyaltyAccount.pointsToNextTier} pts away</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, ((loyaltyAccount.lifetimePoints) / (loyaltyAccount.lifetimePoints + loyaltyAccount.pointsToNextTier)) * 100)}%`, background: `linear-gradient(90deg, ${tierConfig.color}, #f97316)` }} />
                                    </div>
                                </div>
                            )}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} className="rounded-lg p-3 mt-2">
                                <p className="text-xs text-gray-500 mb-1">This Week</p>
                                <p className="text-lg font-bold text-white">Rs. {(loyaltyAccount.totalWeeklySpending || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-600 mt-1">Earn 1 point per Rs. 10 spent</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: `linear-gradient(135deg, ${tierConfig.bg}, rgba(249,115,22,0.15))`, border: `1px solid ${tierConfig.border}`, backdropFilter: 'blur(20px)' }} className="rounded-full px-5 py-3 flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform">
                            <span className="text-xl">{tierConfig.icon}</span>
                            <div>
                                <div className="text-sm font-black text-white">{loyaltyAccount.totalPoints} pts</div>
                                <div style={{ color: tierConfig.color }} className="text-[10px] font-bold uppercase tracking-wider">{loyaltyAccount.tier}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Hero banner */}
            <div className="relative pt-20 pb-28 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop" alt="Menu Background" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/60 via-[#080808]/70 to-[#080808]" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
                    <span className="inline-flex items-center gap-2 bg-orange-600/15 border border-orange-500/30 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span className="text-orange-300 text-xs font-bold tracking-widest uppercase">Campus Canteens</span>
                    </span>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-4">
                        Discover &amp; <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 bg-clip-text text-transparent">Devour</span>
                    </h1>
                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto font-light italic">Fresh, hot, and ready when you are.</p>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-24">

                {/* Recommended Combos (logged-in users) */}
                {user && recommendedCombos.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-orange-500/20 rounded-2xl p-6 shadow-xl relative group/recommended">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-lg shadow-lg shadow-orange-500/20">🎯</div>
                                <div>
                                    <h2 className="text-lg font-black text-white">Recommended For You</h2>
                                    <p className="text-xs text-gray-500">Personalized combo deals based on your ordering habits</p>
                                </div>
                            </div>
                            
                            <button onClick={() => scroll(recommendedScrollRef, 'left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all opacity-0 group-hover/recommended:opacity-100 shadow-xl" aria-label="Scroll left">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={() => scroll(recommendedScrollRef, 'right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all opacity-0 group-hover/recommended:opacity-100 shadow-xl" aria-label="Scroll right">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>

                            <div ref={recommendedScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                                {recommendedCombos.map(combo => (
                                    <div key={combo.id} className="flex-shrink-0 w-[360px] snap-start bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden hover:border-orange-500/30 hover:-translate-y-0.5 transition-all duration-300 group flex flex-col h-[320px]">
                                        {/* Combo Image */}
                                        <div className="h-52 relative overflow-hidden cursor-pointer group" onClick={() => setSelectedCombo(combo)}>
                                            {combo.imageUrl ? (
                                                <img src={combo.imageUrl} alt={combo.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-4xl opacity-20">🎁</div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-500/90 text-white shadow-lg uppercase tracking-tighter">🔥 {combo.recommendationReason}</span>
                                            </div>
                                            {combo.discountPercent > 0 && (
                                                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-black shadow-lg">
                                                    {combo.discountPercent}% OFF
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 flex flex-col flex-grow">
                                            <div className="flex-grow">
                                                <h3 className="text-sm font-black text-white mb-0.5 group-hover:text-orange-300 transition-colors line-clamp-1">{combo.name}</h3>
                                                <p className="text-[9px] text-gray-500 mb-1">{combo.canteenName}</p>
                                                <div className="space-y-1 overflow-y-auto max-h-16 custom-scrollbar pr-1">
                                                    {combo.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-start gap-1.5 text-[10px] text-gray-400 leading-tight">
                                                            <span className="text-orange-500/60 font-black mt-0.5">•</span>
                                                            <span className="flex-1">{item.quantity}x {item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.05] mt-auto">
                                                <div>
                                                    <span className="text-xs text-gray-600 line-through mr-2">Rs. {combo.originalPrice}</span>
                                                    <span className="text-sm font-black text-orange-400">Rs. {combo.comboPrice}</span>
                                                </div>
                                                <button onClick={() => handleAddComboToCart(combo)} disabled={addingCombo[combo.id]}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${addingCombo[combo.id] ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white active:scale-95'}`}>
                                                    {addingCombo[combo.id] ? 'Adding…' : '+ Add Combo'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* All Combo Deals (visible to everyone) */}
                {allCombos.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6 shadow-xl relative group/combos">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">🎁</div>
                                <div>
                                    <h2 className="text-base font-bold text-white tracking-wide">Combo Deals</h2>
                                    <p className="text-xs text-gray-600">Save more with bundle offers</p>
                                </div>
                                {!user && (
                                    <button onClick={() => navigate('/login')} className="ml-auto text-xs text-orange-400 hover:text-orange-300 font-medium border border-orange-500/20 px-3 py-1.5 rounded-lg hover:bg-orange-500/5 transition">
                                        Login for personalized deals →
                                    </button>
                                )}
                            </div>

                            <button onClick={() => scroll(allCombosScrollRef, 'left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all opacity-0 group-hover/combos:opacity-100 shadow-xl" aria-label="Scroll left">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={() => scroll(allCombosScrollRef, 'right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all opacity-0 group-hover/combos:opacity-100 shadow-xl" aria-label="Scroll right">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>

                            <div ref={allCombosScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                                {allCombos.map(combo => (
                                    <div key={combo.id} className="flex-shrink-0 w-[300px] snap-start bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-orange-500/20 transition-all group flex flex-col h-[240px]">
                                        {/* Combo Image */}
                                        <div className="h-44 relative overflow-hidden bg-white/5 cursor-pointer group" onClick={() => setSelectedCombo(combo)}>
                                            {combo.imageUrl ? (
                                                <img src={combo.imageUrl} alt={combo.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🎁</div>
                                            )}
                                            {combo.discountPercent > 0 && (
                                                <div className="absolute top-2 right-2 bg-red-500/90 text-white px-2 py-0.5 rounded text-[10px] font-black">
                                                    {combo.discountPercent}% OFF
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 flex flex-col flex-grow">
                                            <div className="flex-grow">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{combo.category || 'Combo'}</span>
                                                </div>
                                                <h3 className="text-xs font-black text-white mb-0.5 group-hover:text-orange-300 transition-colors line-clamp-1">{combo.name}</h3>
                                                <div className="space-y-0.5 mt-0.5 overflow-y-auto max-h-12 custom-scrollbar pr-1">
                                                    {combo.items.map((item, idx) => (
                                                        <p key={idx} className="text-[9px] text-gray-500 flex items-start gap-1 leading-tight">
                                                            <span className="text-orange-500/60 font-black opacity-50 mt-0.5">•</span>
                                                            <span className="flex-1">{item.quantity}x {item.name}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-1 border-t border-white/[0.03] mt-auto">
                                                <div>
                                                    <span className="text-xs text-gray-600 line-through mr-1">Rs.{combo.originalPrice}</span>
                                                    <span className="text-base font-black text-orange-400">Rs.{combo.comboPrice}</span>
                                                </div>
                                                <button onClick={() => handleAddComboToCart(combo)} disabled={addingCombo[combo.id]}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${addingCombo[combo.id] ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-[0_0_12px_rgba(234,88,12,0.3)] active:scale-95'}`}>
                                                    {addingCombo[combo.id] ? '…' : '+ Add'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Canteen filter bar */}
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
                        <button onClick={() => scroll(scrollContainerRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-20 w-9 h-9 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all opacity-0 group-hover/scroll:opacity-100" aria-label="Scroll left">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={() => scroll(scrollContainerRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-20 w-9 h-9 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-all opacity-0 group-hover/scroll:opacity-100" aria-label="Scroll right">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>

                        <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <button onClick={() => setSelectedRestaurant(null)}
                                className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl transition-all snap-start ${!selectedRestaurant ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-[0_4px_20px_rgba(234,88,12,0.35)]' : 'bg-white/[0.05] border border-white/[0.07] text-gray-400 hover:border-orange-500/30 hover:text-white'}`}
                                style={{ minWidth: '130px' }}>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${!selectedRestaurant ? 'bg-white/20' : 'bg-white/5'}`}>🍽️</div>
                                <div className="text-center">
                                    <p className="font-bold text-xs">All Restaurants</p>
                                    <p className={`text-xs mt-0.5 ${!selectedRestaurant ? 'text-orange-100' : 'text-gray-600'}`}>{menuItems.filter(i => i.available).length} items</p>
                                </div>
                            </button>

                            {Object.values(canteens).filter(canteen => canteen.active).map(canteen => {
                                const itemCount = menuItems.filter(i => i.canteenId === canteen.id && i.available).length
                                const isSelected = selectedRestaurant === canteen.id
                                const queueBadge = getQueueBadge(canteen.id)
                                return (
                                    <button key={canteen.id} onClick={() => setSelectedRestaurant(canteen.id)}
                                        className={`relative flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl transition-all snap-start ${isSelected ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-[0_4px_20px_rgba(234,88,12,0.35)]' : 'bg-white/[0.05] border border-white/[0.07] text-gray-400 hover:border-orange-500/30 hover:text-white'}`}
                                        style={{ minWidth: '130px' }}>
                                        {queueBadge && (
                                            <div className={`absolute top-2 right-2 ${queueBadge.bg} text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1`}>
                                                <span>{queueBadge.emoji}</span><span>{queueBadge.text}</span>
                                            </div>
                                        )}
                                        <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center ${isSelected ? 'ring-2 ring-white/40' : 'ring-1 ring-white/[0.08]'}`}>
                                            {canteen.logoUrl ? (
                                                <img src={canteen.logoUrl} alt={canteen.canteenName} className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="50" font-size="40" text-anchor="middle" x="50"%3E🏪%3C/text%3E%3C/svg%3E' }} />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center text-2xl ${isSelected ? 'bg-white/20' : 'bg-white/5'}`}>🏪</div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-xs line-clamp-1" title={canteen.canteenName}>{canteen.canteenName}</p>
                                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-orange-100' : 'text-gray-600'}`}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                                            {canteen.rating > 0 && (
                                                <div className={`flex items-center justify-center gap-1 mt-1 ${isSelected ? 'text-yellow-200' : 'text-yellow-500'}`}>
                                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
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

                {/* Search & category filter */}
                <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-4 md:p-5 mb-10 shadow-xl">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96 group">
                            <svg className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" placeholder="Search for food…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-orange-500/60 focus:bg-white/[0.08] transition-all outline-none text-white placeholder-gray-600 font-medium" />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 ${selectedCategory === cat ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.35)]' : 'bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:border-orange-500/30 hover:text-white'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canteen Operating Hours */}
                {selectedRestaurant && canteens[selectedRestaurant] && (
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-500/5 py-2.5 px-5 rounded-xl border border-orange-500/10 w-fit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Operating: {canteens[selectedRestaurant].openingTime?.split('T')[1]?.substring(0, 5) || canteens[selectedRestaurant].openingTime || '08:00 AM'} — {canteens[selectedRestaurant].closingTime?.split('T')[1]?.substring(0, 5) || canteens[selectedRestaurant].closingTime || '08:00 PM'}</span>
                    </div>
                )}

                {/* Results count */}
                {filteredItems.length > 0 && (
                    <p className="text-gray-600 text-sm font-medium mb-6">
                        Showing <span className="text-orange-500 font-bold">{filteredItems.length}</span> {filteredItems.length === 1 ? 'item' : 'items'}
                        {selectedCategory !== 'All' && <span> in <span className="text-white">{selectedCategory}</span></span>}
                    </p>
                )}

                {/* Menu grid */}
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
                                <div key={item.id} className="group bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-orange-500/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col" style={{ animationDelay: `${index * 40}ms` }}>
                                    <div className="relative h-52 overflow-hidden cursor-pointer group" onClick={() => setSelectedItem(item)}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-5xl opacity-20">🍽️</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                                            <span className="text-sm font-black text-white">Rs.{item.price}</span>
                                        </div>
                                        {item.vegetarian && (
                                            <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm p-1.5 rounded-lg">
                                                <div className="border border-white p-0.5 rounded-sm"><div className="w-2 h-2 bg-white rounded-full" /></div>
                                            </div>
                                        )}
                                        <div className="absolute bottom-3 left-3">
                                            <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-bold text-white/80 uppercase tracking-widest border border-white/10">{item.category}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className="text-base font-black text-white leading-tight group-hover:text-orange-300 transition-colors line-clamp-1 mb-1" title={item.name}>{item.name}</h3>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <svg className="w-3.5 h-3.5 text-orange-500/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="text-xs font-medium truncate max-w-[120px]" title={canteen?.canteenName ?? 'Campus Canteen'}>{canteen?.canteenName ?? 'Campus Canteen'}</span>
                                            </div>
                                            {canteen?.rating > 0 && (
                                                <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">
                                                    <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    <span className="text-[10px] font-bold text-yellow-400">{canteen.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{item.description || 'A delicious choice for your meal today.'}</p>
                                            {item.description && item.description.length > 60 && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item) }}
                                                    className="text-orange-500 hover:text-orange-400 text-[10px] font-bold mt-1 transition-colors"
                                                >
                                                    See more
                                                </button>
                                            )}
                                        </div>
                                        <button onClick={() => handleAddToCart(item)} disabled={addingToCart[item.id]}
                                            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 mt-auto ${addingToCart[item.id] ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-[0_0_25px_rgba(234,88,12,0.4)] hover:scale-[1.02] active:scale-95'}`}>
                                            {addingToCart[item.id] ? (
                                                <><div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />Adding…</>
                                            ) : (
                                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add to Cart</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Glassmorphism Food Item Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md transition-all duration-500 animate-in fade-in" onClick={() => setSelectedItem(null)}>
                    <div className="relative w-full max-w-2xl bg-white/[0.03] border border-white/[0.1] backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col sm:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        {/* Close Button */}
                        <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all text-lg shadow-xl" title="Close">✕</button>

                        {/* Modal Image Section */}
                        <div className="w-full sm:w-1/2 h-64 sm:h-auto relative bg-[#111]">
                            {selectedItem.imageUrl ? (
                                <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">🍽️</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest self-start">{selectedItem.category}</span>
                                {selectedItem.vegetarian && (
                                    <div className="bg-green-500/90 backdrop-blur-sm p-1.5 rounded-lg self-start">
                                        <div className="border border-white p-0.5 rounded-sm"><div className="w-2 h-2 bg-white rounded-full" /></div>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-8 left-8 pr-8 text-left">
                                <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">{selectedItem.name}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <p className="text-orange-400 font-bold text-sm uppercase tracking-wide truncate max-w-[200px]">{canteens[selectedItem.canteenId]?.canteenName || 'Campus Canteen'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Details Section */}
                        <div className="w-full sm:w-1/2 p-10 flex flex-col bg-[#0d0d0d]/40 text-left">
                            <div className="flex-grow">
                                <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">Description</h3>
                                <p className="text-gray-400 text-sm leading-relaxed font-medium mb-8 italic">
                                    {selectedItem.description || "Freshly prepared with premium campus-sourced ingredients. A highly recommended choice for a satisfying meal."}
                                </p>

                                {canteens[selectedItem.canteenId]?.rating > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">Restaurant Trust</h3>
                                        <div className="flex items-center gap-2">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < Math.round(canteens[selectedItem.canteenId].rating) ? 'text-yellow-400 fill-current' : 'text-white/10 fill-current'}`} viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-xs font-black text-white ml-1">{canteens[selectedItem.canteenId].rating.toFixed(1)} Rating</span>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 shadow-inner mb-8">
                                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">Price per serving</p>
                                    <div className="flex items-end gap-1">
                                        <span className="text-sm font-bold text-gray-500 mb-1">Rs.</span>
                                        <span className="text-4xl font-black text-white tracking-tighter">{selectedItem.price}</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => { handleAddToCart(selectedItem); setSelectedItem(null); }} disabled={addingToCart[selectedItem.id]}
                                className={`w-full py-5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl group/btn overflow-hidden ${addingToCart[selectedItem.id] ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 text-white hover:scale-[1.03] hover:shadow-orange-500/40'}`}>
                                <span className="relative z-10 flex items-center gap-3">
                                    {addingToCart[selectedItem.id] ? 'Processing Order…' : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add to My Order</>}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Glassmorphism Combo Detail Modal */}
            {selectedCombo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md transition-all duration-500 animate-in fade-in" onClick={() => setSelectedCombo(null)}>
                    <div className="relative w-full max-w-2xl bg-white/[0.03] border border-white/[0.1] backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col sm:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        {/* Close Button */}
                        <button onClick={() => setSelectedCombo(null)} className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all text-lg shadow-xl" title="Close">✕</button>

                        {/* Modal Image Section */}
                        <div className="w-full sm:w-1/2 h-64 sm:h-auto relative bg-[#111]">
                            {selectedCombo.imageUrl ? (
                                <img src={selectedCombo.imageUrl} alt={selectedCombo.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">🎁</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute bottom-8 left-8 pr-8">
                                <span className="px-3 py-1 bg-orange-500/90 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Combo Deal Details</span>
                                <h2 className="text-3xl font-black text-white mt-3 leading-tight tracking-tighter">{selectedCombo.name}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    <p className="text-orange-400 font-bold text-sm uppercase tracking-wide">{selectedCombo.canteenName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Details Section */}
                        <div className="w-full sm:w-1/2 p-8 flex flex-col bg-[#0d0d0d]/40">
                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 mb-8">
                                <div className="mb-8">
                                    <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-5 border-b border-white/5 pb-2">Included in this bundle</h3>
                                    <div className="space-y-4">
                                        {selectedCombo.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group/item">
                                                <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-xl group-hover/item:scale-110 group-hover/item:bg-orange-500/10 group-hover/item:border-orange-500/20 transition-all duration-300">🍜</div>
                                                <div>
                                                    <p className="text-sm font-black text-white mb-0.5 group-hover/item:text-orange-300 transition-colors uppercase tracking-tight">{item.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-orange-500/80 bg-orange-500/10 px-1.5 py-0.5 rounded">x{item.quantity}</span>
                                                        <span className="text-[10px] text-gray-500 font-medium italic">portion weight standardized</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 shadow-inner">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">A-la-carte total</span>
                                        <span className="text-sm text-gray-400 line-through font-bold">Rs. {selectedCombo.originalPrice}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">Exclusive Combo Offer</p>
                                            <span className="text-3xl font-black text-white tracking-tighter">Rs. {selectedCombo.comboPrice}</span>
                                        </div>
                                        {selectedCombo.discountPercent > 0 && (
                                            <div className="bg-green-500/90 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(34,197,94,0.3)] rotate-3">
                                                -{selectedCombo.discountPercent}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => { handleAddComboToCart(selectedCombo); setSelectedCombo(null); }} disabled={addingCombo[selectedCombo.id]}
                                className={`w-full py-5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl relative group/btn overflow-hidden ${addingCombo[selectedCombo.id] ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 text-white hover:scale-[1.03] hover:shadow-orange-500/40'}`}>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                <span className="relative z-10 flex items-center gap-3">
                                    {addingCombo[selectedCombo.id] ? 'Synchronizing with Cart…' : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Activate Special Offer</>}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default Menu
