import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import orderService from '../services/orderService'
import reviewService from '../services/reviewService'
import userService from '../services/userService'
import { imgbbService } from '../services/imgbbService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Dashboard() {
    const { user, logout, refreshUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [orders, setOrders] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        reviews: 0,
        favorites: 0
    })

    // Profile Edit State
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
        profilePicture: user?.profilePicture || ''
    })
    const [updatingProfile, setUpdatingProfile] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                profilePicture: user.profilePicture || ''
            })
        }
        fetchData()
    }, [user])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [ordersData, reviewsData] = await Promise.all([
                orderService.getUserOrders(),
                reviewService.getMyReviews()
            ])

            const sortedOrders = ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setOrders(sortedOrders)
            setReviews(reviewsData)

            setStats({
                total: ordersData.length,
                completed: ordersData.filter(o => o.paymentStatus === 'succeeded').length,
                reviews: reviewsData.length,
                favorites: 0 // Placeholder
            })
        } catch (err) {
            console.error('Error fetching dashboard data:', err)
        } finally {
            setLoading(false)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        try {
            setUpdatingProfile(true)
            setMessage({ type: '', text: '' })
            const updatedUser = await userService.updateUserProfile(profileData)
            localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updatedUser }))
            await refreshUser()
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (err) {
            console.error('Error updating profile:', err)
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
        } finally {
            setUpdatingProfile(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setUploadingImage(true)
            const imageUrl = await imgbbService.uploadImage(file)
            setProfileData(prev => ({ ...prev, profilePicture: imageUrl }))

            // Auto-save the image update
            const updatedUser = await userService.updateUserProfile({ ...profileData, profilePicture: imageUrl })
            localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updatedUser }))
            await refreshUser()
            setMessage({ type: 'success', text: 'Profile picture updated!' })
        } catch (err) {
            console.error('Error uploading image:', err)
            setMessage({ type: 'error', text: 'Failed to upload image.' })
        } finally {
            setUploadingImage(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'orders', label: 'My Orders', icon: '🛍️' },
        { id: 'reviews', label: 'My Reviews', icon: '⭐' },
        { id: 'profile', label: 'Edit Profile', icon: '👤' }
    ]

    return (
        <div className="min-h-screen bg-[#080808] text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header Section */}
                <div className="mb-10 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 transition-all duration-500 shadow-2xl">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-3xl font-bold">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-500 transition-colors shadow-lg border-2 border-[#080808]">
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight mb-2">
                                    {getGreeting()}, <span className="text-orange-500">{user?.firstName || user?.username}!</span>
                                </h1>
                                <p className="text-gray-500 font-medium">Welcome back to your CampusEats dashboard.</p>
                            </div>
                        </div>
                        <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-orange-600 hover:border-orange-500 transition-all duration-300 group">
                            <svg className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Browse Menu
                        </Link>
                    </div>
                </div>

                {/* Main Tabs Logic */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                                : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/20 hover:text-white'}`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-[#111] border border-white/[0.08] rounded-3xl p-1 shadow-2xl overflow-hidden min-h-[500px]">
                    <div className="p-6 md:p-8">
                        {activeTab === 'overview' && (
                            <div className="animate-fade-in-up">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                    {[
                                        { label: 'Total Orders', value: stats.total, icon: '🛍️', color: 'blue' },
                                        { label: 'Completed', value: stats.completed, icon: '✅', color: 'green' },
                                        { label: 'Reviews', value: stats.reviews, icon: '⭐', color: 'yellow' },
                                        { label: 'Favorites', value: stats.favorites, icon: '❤️', color: 'red' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                                            <div className="text-2xl mb-2">{stat.icon}</div>
                                            <div className="text-3xl font-black mb-1">{stat.value}</div>
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black">Recent Activity</h2>
                                    <button onClick={() => setActiveTab('orders')} className="text-orange-500 text-sm font-bold hover:underline">View All</button>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-20">
                                        <div className="w-10 h-10 border-2 border-white/10 border-t-orange-500 rounded-full animate-spin" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                                        <p className="text-gray-500 font-medium">No recent activity found.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.slice(0, 3).map(order => (
                                            <div key={order.id} className="group bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.08] transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-tighter">Order #{order.id.substring(0, 8)}</div>
                                                        <div className="text-lg font-bold mb-1">{order.orderItems?.[0]?.name || 'Unknown Item'} {order.orderItems?.length > 1 ? `+${order.orderItems.length - 1} more` : ''}</div>
                                                        <div className="text-xs text-gray-600 font-medium">{formatDate(order.createdAt)} • {order.canteenName || 'Campus Canteen'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-black text-white mb-2">Rs.{order.totalAmount?.toFixed(2)}</div>
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${order.paymentStatus === 'succeeded' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="animate-fade-in-up">
                                <h2 className="text-2xl font-black mb-6">Order History</h2>
                                {orders.length === 0 ? (
                                    <div className="text-center py-20">
                                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {orders.map(order => (
                                            <div key={order.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <span className="text-xs font-black px-2 py-1 bg-white/10 rounded-md text-gray-400">#{order.id.substring(0, 8)}</span>
                                                            <span className="text-xs text-gray-500 font-bold">{formatDate(order.createdAt)}</span>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {order.orderItems?.map((item, i) => (
                                                                <div key={i} className="flex justify-between items-center text-sm">
                                                                    <span className="text-gray-300"><span className="font-bold text-orange-500">{item.quantity}x</span> {item.name}</span>
                                                                    <span className="text-gray-500">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                                            <span className="text-sm font-bold text-gray-500 uppercase">Total Amount</span>
                                                            <span className="text-xl font-black text-orange-500">Rs.{order.totalAmount?.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="md:w-48 flex flex-col justify-between items-end">
                                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 ${order.paymentStatus === 'succeeded' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                        {order.orderStatus !== 'COMPLETED' && (
                                                            <Link to={`/orders/track/${order.id}`} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-bold hover:bg-white/10 transition-all">Track Order</Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="animate-fade-in-up">
                                <h2 className="text-2xl font-black mb-6">Your Reviews</h2>
                                {reviews.length === 0 ? (
                                    <div className="text-center py-20">
                                        <p className="text-gray-500">You haven't written any reviews yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {reviews.map(review => (
                                            <div key={review.id} className="bg-white/5 border border-white/5 rounded-2xl p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg mb-1">{review.canteenName}</h3>
                                                        <div className="flex gap-1 mb-2">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-500' : 'text-gray-700'}`}>★</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-600 font-bold">{formatDate(review.createdAt)}</span>
                                                </div>
                                                <p className="text-gray-400 text-sm italic leading-relaxed">"{review.comment || 'No comment provided'}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="animate-fade-in-up max-w-2xl mx-auto">
                                <h2 className="text-2xl font-black mb-8">Profile Settings</h2>

                                {message.text && (
                                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-500">First Name</label>
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Last Name</label>
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profileData.phoneNumber}
                                            onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                            placeholder="+94 7X XXX XXXX"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Default Address</label>
                                        <textarea
                                            value={profileData.address}
                                            onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-all font-medium min-h-[100px]"
                                            placeholder="Enter your address"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={updatingProfile}
                                            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                        >
                                            {updatingProfile ? 'Saving Changes...' : 'Update Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    )
}

export default Dashboard
