import { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import orderService from '../services/orderService'
import reviewService from '../services/reviewService'
import userService from '../services/userService'
import { imgbbService } from '../services/imgbbService'
import ReviewModal from '../components/ReviewModal'
import QRCodeDisplay from '../components/QRCodeDisplay'

function UserProfile() {
    const { user, logout, setUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const location = useLocation()
    const fileInputRef = useRef(null)

    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(location.search)
        return params.get('tab') || 'profile'
    })
    const [profile, setProfile] = useState(null)
    const [orders, setOrders] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [ordersLoading, setOrdersLoading] = useState(false)
    const [reviewsLoading, setReviewsLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [validationErrors, setValidationErrors] = useState({})

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: ''
    })

    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        reviews: 0,
        pending: 0
    })

    useEffect(() => {
        fetchProfile()
        fetchOrders()
        fetchReviews()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const data = await userService.getProfile()
            setProfile(data)
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || ''
            })
        } catch (err) {
            console.error('Error fetching profile:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true)
            const data = await orderService.getUserOrders()
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setOrders(sorted)
            setStats(prev => ({
                ...prev,
                total: data.length,
                completed: data.filter(o => o.paymentStatus === 'succeeded').length,
                pending: data.filter(o => o.orderStatus && o.orderStatus !== 'COMPLETED').length
            }))
        } catch (err) {
            console.error('Error fetching orders:', err)
        } finally {
            setOrdersLoading(false)
        }
    }

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true)
            const data = await reviewService.getMyReviews()
            setReviews(data)
            setStats(prev => ({ ...prev, reviews: data.length }))
        } catch (err) {
            console.error('Error fetching reviews:', err)
        } finally {
            setReviewsLoading(false)
        }
    }

    const validateForm = () => {
        const errors = {}
        // First Name
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required'
        } else if (formData.firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters'
        } else if (formData.firstName.trim().length > 50) {
            errors.firstName = 'First name must be less than 50 characters'
        } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
            errors.firstName = 'First name can only contain letters'
        }
        // Last Name
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required'
        } else if (formData.lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters'
        } else if (formData.lastName.trim().length > 50) {
            errors.lastName = 'Last name must be less than 50 characters'
        } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
            errors.lastName = 'Last name can only contain letters'
        }
        // Phone Number
        if (formData.phoneNumber.trim()) {
            const digitsOnly = formData.phoneNumber.replace(/[\s\-\(\)\+]/g, '')
            if (digitsOnly.length < 9 || digitsOnly.length > 15) {
                errors.phoneNumber = 'Phone number must be 9-15 digits'
            } else if (!/^[\d\s\-\(\)\+]+$/.test(formData.phoneNumber.trim())) {
                errors.phoneNumber = 'Invalid phone number format'
            }
        }
        // Address
        if (formData.address.trim()) {
            if (formData.address.trim().length < 5) {
                errors.address = 'Address must be at least 5 characters'
            } else if (formData.address.trim().length > 200) {
                errors.address = 'Address must be less than 200 characters'
            }
        }
        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        if (!validateForm()) return
        try {
            setSaving(true)
            setErrorMsg('')
            const updated = await userService.updateProfile(formData)
            setProfile(updated)
            setEditing(false)
            setSuccessMsg('Profile updated successfully!')
            const currentUser = JSON.parse(localStorage.getItem('user'))
            if (currentUser) {
                currentUser.firstName = updated.firstName
                currentUser.phoneNumber = updated.phoneNumber
                localStorage.setItem('user', JSON.stringify(currentUser))
                if (setUser) setUser(currentUser)
            }
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setErrorMsg('Failed to update profile')
            console.error('Error updating profile:', err)
        } finally {
            setSaving(false)
        }
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!validTypes.includes(file.type)) {
            setErrorMsg('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
            setTimeout(() => setErrorMsg(''), 3000)
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('Image must be less than 5MB')
            setTimeout(() => setErrorMsg(''), 3000)
            return
        }
        try {
            setUploadingPhoto(true)
            // Upload to imgbb
            const imageUrl = await imgbbService.uploadImage(file)
            // Save URL to backend
            const updated = await userService.updateProfile({ profilePhotoUrl: imageUrl })
            setProfile(prev => ({ ...prev, profilePhotoUrl: imageUrl }))
            const currentUser = JSON.parse(localStorage.getItem('user'))
            if (currentUser) {
                currentUser.profilePhotoUrl = imageUrl
                localStorage.setItem('user', JSON.stringify(currentUser))
                if (setUser) setUser(currentUser)
            }
            setSuccessMsg('Profile photo updated!')
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setErrorMsg('Failed to upload photo')
            console.error('Error uploading photo:', err)
        } finally {
            setUploadingPhoto(false)
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleRemovePhoto = async () => {
        try {
            setUploadingPhoto(true)
            await userService.updateProfile({ profilePhotoUrl: '' })
            setProfile(prev => ({ ...prev, profilePhotoUrl: null }))
            const currentUser = JSON.parse(localStorage.getItem('user'))
            if (currentUser) {
                currentUser.profilePhotoUrl = null
                localStorage.setItem('user', JSON.stringify(currentUser))
                if (setUser) setUser(currentUser)
            }
            setSuccessMsg('Profile photo removed!')
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (err) {
            setErrorMsg('Failed to remove photo')
            console.error('Error removing photo:', err)
        } finally {
            setUploadingPhoto(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        })
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const getProfileCompletion = () => {
        if (!profile) return 0
        const fields = [profile.firstName, profile.lastName, profile.email, profile.phoneNumber, profile.address, profile.profilePhotoUrl]
        const filled = fields.filter(f => f && f.trim && f.trim() !== '').length
        return Math.round((filled / fields.length) * 100)
    }

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'succeeded': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-white/10 text-white/60 border-white/20'
        }
    }

    const canReview = (order) => {
        return order.orderStatus === 'COMPLETED' &&
            order.paymentStatus?.toLowerCase() === 'succeeded' &&
            !order.hasReview
    }

    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-white/20'}`}
                    fill={star <= rating ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ))}
            <span className="ml-1.5 text-xs font-semibold text-white/60">{rating}/5</span>
        </div>
    )

    const completion = getProfileCompletion()

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'orders', label: 'My Orders', icon: '📦', count: stats.total },
        { id: 'reviews', label: 'My Reviews', icon: '⭐', count: stats.reviews }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]">
                <Navbar />
                <div className="flex justify-center items-center py-32">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Navbar />

            {/* Page Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-600/8 via-transparent to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
                    <h1 className="text-4xl font-black text-white tracking-tight">My Account</h1>
                    <p className="text-white/40 mt-2 text-sm font-medium">Manage your profile, orders, and reviews</p>
                </div>
            </div>

            {/* Success/Error Messages */}
            {successMsg && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-pulse">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {successMsg}
                    </div>
                </div>
            )}
            {errorMsg && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl text-sm font-semibold">
                        {errorMsg}
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex gap-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1.5 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/20'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* ─── Left Column ─── */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-orange-600/10 to-transparent" />

                            {/* Photo */}
                            <div className="relative inline-block mb-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-[3px] cursor-pointer group relative"
                                >
                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#141414]">
                                        {profile?.profilePhotoUrl ? (
                                            <img src={profile.profilePhotoUrl} alt="Profile"
                                                className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/30">
                                                {profile?.firstName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        {uploadingPhoto ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white" />
                                        ) : (
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                {/* Online indicator */}
                                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-[#0a0a0a]" />
                                <input
                                    type="file" ref={fileInputRef} onChange={handlePhotoUpload}
                                    accept="image/*" className="hidden"
                                />
                                {/* Remove photo button */}
                                {profile?.profilePhotoUrl && (
                                    <button
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
                                        title="Remove photo"
                                    >
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-white">
                                {profile?.firstName || user?.username || 'User'}
                            </h2>
                            <p className="text-white/40 text-sm mt-1">{profile?.email}</p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Active Member
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={() => { setActiveTab('profile'); setEditing(true) }}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2 mb-5">
                                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Quick Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Total Orders', value: stats.total, color: 'from-blue-500 to-indigo-500', icon: '📦' },
                                    { label: 'Completed', value: stats.completed, color: 'from-emerald-500 to-teal-500', icon: '✅' },
                                    { label: 'Reviews', value: stats.reviews, color: 'from-amber-500 to-orange-500', icon: '⭐' },
                                    { label: 'In Progress', value: stats.pending, color: 'from-purple-500 to-pink-500', icon: '🔄' }
                                ].map(stat => (
                                    <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.05] transition-colors">
                                        <div className="text-lg mb-1">{stat.icon}</div>
                                        <p className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                            {stat.value}
                                        </p>
                                        <p className="text-white/40 text-xs font-semibold mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── Right Column ─── */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Profile Completion */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Profile Completion
                                </h3>
                                <span className={`text-sm font-bold ${completion === 100 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {completion}%
                                </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${completion === 100
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                        : 'bg-gradient-to-r from-orange-500 to-red-500'
                                        }`}
                                    style={{ width: `${completion}%` }}
                                />
                            </div>
                            {completion < 100 && (
                                <p className="text-white/30 text-xs mt-2">Complete your profile to unlock all features</p>
                            )}
                        </div>

                        {/* ── PROFILE TAB ── */}
                        {activeTab === 'profile' && (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
                                    <span className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    Account Information
                                </h3>

                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        {/* First Name */}
                                        <div>
                                            <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={e => { setFormData(prev => ({ ...prev, firstName: e.target.value })); setValidationErrors(prev => ({ ...prev, firstName: undefined })) }}
                                                disabled={!editing}
                                                className={`w-full bg-white/[0.04] border ${validationErrors.firstName ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all disabled:opacity-50`}
                                                placeholder="Your first name"
                                            />
                                            {validationErrors.firstName && <p className="text-red-400 text-xs mt-1.5 font-medium">{validationErrors.firstName}</p>}
                                        </div>

                                        {/* Last Name */}
                                        <div>
                                            <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={e => { setFormData(prev => ({ ...prev, lastName: e.target.value })); setValidationErrors(prev => ({ ...prev, lastName: undefined })) }}
                                                disabled={!editing}
                                                className={`w-full bg-white/[0.04] border ${validationErrors.lastName ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all disabled:opacity-50`}
                                                placeholder="Your last name"
                                            />
                                            {validationErrors.lastName && <p className="text-red-400 text-xs mt-1.5 font-medium">{validationErrors.lastName}</p>}
                                        </div>

                                        {/* Username (read-only) */}
                                        <div>
                                            <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Username
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={profile?.username || ''}
                                                    disabled
                                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white/50 text-sm font-medium cursor-not-allowed"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email (read-only) */}
                                        <div>
                                            <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={profile?.email || ''}
                                                    disabled
                                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white/50 text-sm font-medium cursor-not-allowed"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div>
                                            <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={e => { setFormData(prev => ({ ...prev, phoneNumber: e.target.value })); setValidationErrors(prev => ({ ...prev, phoneNumber: undefined })) }}
                                                disabled={!editing}
                                                className={`w-full bg-white/[0.04] border ${validationErrors.phoneNumber ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all disabled:opacity-50`}
                                                placeholder="Your phone number"
                                            />
                                            {validationErrors.phoneNumber && <p className="text-red-400 text-xs mt-1.5 font-medium">{validationErrors.phoneNumber}</p>}
                                        </div>

                                        {/* Campus Address */}
                                        <div>
                                            <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Campus Address
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={e => { setFormData(prev => ({ ...prev, address: e.target.value })); setValidationErrors(prev => ({ ...prev, address: undefined })) }}
                                                disabled={!editing}
                                                className={`w-full bg-white/[0.04] border ${validationErrors.address ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all disabled:opacity-50`}
                                                placeholder="Your campus address"
                                            />
                                            {validationErrors.address && <p className="text-red-400 text-xs mt-1.5 font-medium">{validationErrors.address}</p>}
                                        </div>

                                        {/* Member Since (read-only) */}
                                        <div className="md:col-span-2">
                                            <label className="text-white/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Member Since
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formatDate(profile?.createdAt)}
                                                    disabled
                                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white/50 text-sm font-medium cursor-not-allowed"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-8">
                                        {editing ? (
                                            <>
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {saving ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                    {saving ? 'Saving...' : 'Update Profile'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditing(false)
                                                        setValidationErrors({})
                                                        setFormData({
                                                            firstName: profile?.firstName || '',
                                                            lastName: profile?.lastName || '',
                                                            phoneNumber: profile?.phoneNumber || '',
                                                            address: profile?.address || ''
                                                        })
                                                    }}
                                                    className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setEditing(true)}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ── ORDERS TAB ── */}
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                {ordersLoading ? (
                                    <div className="flex justify-center items-center py-16">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-4">
                                            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2">No orders yet</h3>
                                        <p className="text-white/40 text-sm mb-6">Start exploring our menu and place your first order!</p>
                                        <a href="/menu"
                                            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all">
                                            Browse Menu
                                        </a>
                                    </div>
                                ) : (
                                    orders.map(order => (
                                        <div key={order.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
                                            {/* Order Header */}
                                            <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 border-b border-white/[0.06] px-6 py-4">
                                                <div className="flex justify-between items-start flex-wrap gap-3">
                                                    <div>
                                                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Order ID</p>
                                                        <p className="font-mono font-bold text-white text-sm mt-0.5">{order.id}</p>
                                                        <p className="text-white/30 text-xs mt-1">{formatDateTime(order.createdAt)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                            {order.paymentStatus?.toUpperCase() || 'PENDING'}
                                                        </span>
                                                        <p className="text-xl font-black text-white mt-1">Rs.{order.totalAmount?.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="p-6">
                                                <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    Items ({order.orderItems?.length || 0})
                                                </h4>
                                                <div className="space-y-3">
                                                    {order.orderItems && order.orderItems.length > 0 ? (
                                                        order.orderItems.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 bg-white/[0.02] rounded-xl p-3 hover:bg-white/[0.04] transition-colors">
                                                                <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white/5">
                                                                    {item.imageUrl ? (
                                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-white/10">
                                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                                                                    <p className="text-white/30 text-xs">{item.canteenName} · Qty: {item.quantity}</p>
                                                                </div>
                                                                <p className="text-white font-bold text-sm whitespace-nowrap">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-white/30 text-sm text-center py-3">No items</p>
                                                    )}
                                                </div>

                                                {/* Pickup Details */}
                                                {(order.pickupDate || order.pickupTime) && (
                                                    <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                                                        <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                                            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            Pickup Details
                                                        </h4>
                                                        <div className="flex gap-6">
                                                            {order.pickupDate && (
                                                                <div>
                                                                    <p className="text-white/30 text-xs">Date</p>
                                                                    <p className="text-white font-semibold text-sm">{order.pickupDate}</p>
                                                                </div>
                                                            )}
                                                            {order.pickupTime && (
                                                                <div>
                                                                    <p className="text-white/30 text-xs">Time</p>
                                                                    <p className="text-white font-semibold text-sm">{order.pickupTime}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* QR Code */}
                                                {order.paymentStatus?.toLowerCase() === 'succeeded' && order.qrCodeBase64 && (
                                                    <div className="mt-4 bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
                                                        <h4 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
                                                            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                            </svg>
                                                            Your Pickup QR Code
                                                        </h4>
                                                        <p className="text-white/30 text-xs mb-3">📱 Show this to canteen staff for quick pickup</p>
                                                        <div className="bg-white rounded-xl p-3 inline-block">
                                                            <QRCodeDisplay qrCodeBase64={order.qrCodeBase64} orderId={order.id} size={180} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Track / Review */}
                                                <div className="flex gap-3 mt-4">
                                                    {order.orderStatus && order.orderStatus !== 'COMPLETED' && (
                                                        <a href={`/orders/track/${order.id}`}
                                                            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm text-center hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                                                            📍 Track Order
                                                        </a>
                                                    )}
                                                    {order.orderStatus === 'COMPLETED' && (
                                                        <>
                                                            {order.hasReview ? (
                                                                <div className="flex-1 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                                                                    <span className="text-emerald-400 font-bold text-sm">✅ Reviewed</span>
                                                                </div>
                                                            ) : canReview(order) ? (
                                                                <button
                                                                    onClick={() => { setSelectedOrder(order); setReviewModalOpen(true) }}
                                                                    className="flex-1 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                                                                    ⭐ Write a Review
                                                                </button>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── REVIEWS TAB ── */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-4">
                                {reviewsLoading ? (
                                    <div className="flex justify-center items-center py-16">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500" />
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-4">
                                            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2">No reviews yet</h3>
                                        <p className="text-white/40 text-sm mb-6">Complete an order and share your experience!</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors">
                                            {/* Review Header */}
                                            <div className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-b border-white/[0.06] px-6 py-4">
                                                <div className="flex justify-between items-start flex-wrap gap-3">
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm">{review.canteenName}</h4>
                                                        <p className="text-white/30 text-xs mt-1">{formatDate(review.createdAt)}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Review Content */}
                                            <div className="p-6">
                                                {review.orderItems && review.orderItems.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                            Items Ordered
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {review.orderItems.map((item, idx) => (
                                                                <span key={idx} className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                                                                    {item}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {review.comment ? (
                                                    <div className="bg-white/[0.03] rounded-xl p-4">
                                                        <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Your Review</p>
                                                        <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-white/30 text-sm italic">No written review provided</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Review Modal */}
            {selectedOrder && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => { setReviewModalOpen(false); setSelectedOrder(null) }}
                    order={selectedOrder}
                    onReviewSubmitted={() => { fetchOrders(); fetchReviews() }}
                />
            )}
        </div>
    )
}

export default UserProfile
