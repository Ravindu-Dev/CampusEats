import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import canteenService from '../services/canteenService'
import orderService from '../services/orderService'
import { menuItemService } from '../services/menuItemService'
import CanteenLayout from '../components/CanteenLayout'
import { imgbbService } from '../services/imgbbService'

const cuisineOptions = ['INDIAN', 'CHINESE', 'CONTINENTAL', 'ITALIAN', 'MEXICAN', 'BEVERAGES', 'SNACKS', 'DESSERTS']
const allDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function CanteenDashboard() {
    const [canteenOwner, setCanteenOwner] = useState(null)
    const [canteen, setCanteen] = useState(null)
    const [orders, setOrders] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    // Edit modal states
    const [showEditCanteen, setShowEditCanteen] = useState(false)
    const [showEditOwner, setShowEditOwner] = useState(false)
    const [editCanteenData, setEditCanteenData] = useState({})
    const [editOwnerData, setEditOwnerData] = useState({})
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState('')
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) {
            navigate('/canteen/login')
            return
        }
        setCanteenOwner(owner)

        const fetchData = async () => {
            try {
                if (owner.canteenId) {
                    const [canteenData, ordersData, menuData] = await Promise.all([
                        canteenService.getCanteenById(owner.canteenId).catch(err => {
                            console.error('Error fetching canteen:', err)
                            return null
                        }),
                        orderService.getCanteenOrders(owner.canteenId).catch(err => {
                            console.error('Error fetching orders:', err)
                            return []
                        }),
                        menuItemService.getMenuItems(owner.canteenId).catch(err => {
                            console.error('Error fetching menu items:', err)
                            return []
                        })
                    ])

                    setCanteen(canteenData)
                    setOrders(ordersData || [])
                    setMenuItems(menuData || [])
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [navigate])

    // ─── Edit Handlers ───
    const openEditCanteen = () => {
        setEditCanteenData({
            canteenName: canteen?.canteenName || '',
            location: canteen?.location || '',
            campus: canteen?.campus || '',
            floorNumber: canteen?.floorNumber || '',
            roomNumber: canteen?.roomNumber || '',
            phoneNumber: canteen?.phoneNumber || '',
            alternativeContactNumber: canteen?.alternativeContactNumber || '',
            openingTime: canteen?.openingTime || '',
            closingTime: canteen?.closingTime || '',
            description: canteen?.description || '',
            cuisineTypes: canteen?.cuisineTypes || [],
            operatingDays: canteen?.operatingDays || [],
            seatingCapacity: canteen?.seatingCapacity || '',
            averagePreparationTime: canteen?.averagePreparationTime || '',
            deliveryAvailable: canteen?.deliveryAvailable || false,
            pickupAvailable: canteen?.pickupAvailable !== undefined ? canteen.pickupAvailable : true,
            logoUrl: canteen?.logoUrl || '',
        })
        setSaveError('')
        setSaveSuccess('')
        setErrors({})
        setShowEditCanteen(true)
    }

    const openEditOwner = () => {
        setEditOwnerData({
            ownerName: canteenOwner?.ownerName || '',
            phoneNumber: canteen?.phoneNumber || canteenOwner?.phoneNumber || '',
        })
        setSaveError('')
        setSaveSuccess('')
        setErrors({})
        setShowEditOwner(true)
    }

    const handleSaveCanteen = async () => {
        const validationErrors = validateCanteenForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            setSaveError('Please fix the errors below.')
            return
        }

        setSaving(true)
        setSaveError('')
        try {
            const updated = await canteenService.updateCanteen(canteen.id, editCanteenData)
            setCanteen(updated)
            setSaveSuccess('Canteen details updated successfully!')
            setTimeout(() => { setShowEditCanteen(false); setSaveSuccess('') }, 1200)
        } catch (err) {
            setSaveError(err.response?.data || 'Failed to update canteen details.')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveOwner = async () => {
        const validationErrors = validateOwnerForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            setSaveError('Please fix the errors below.')
            return
        }

        setSaving(true)
        setSaveError('')
        try {
            // We need the owner ID. The localStorage stores the login response.
            // The owner id is stored in canteen.ownerId
            const ownerId = canteen?.ownerId
            if (!ownerId) throw new Error('Owner ID not found')

            const result = await canteenAuthService.updateOwnerProfile(ownerId, editOwnerData)

            // Update localStorage with new owner name
            const stored = canteenAuthService.getCurrentCanteenOwner()
            if (stored) {
                stored.ownerName = result.ownerName
                localStorage.setItem('canteenOwner', JSON.stringify(stored))
            }
            setCanteenOwner(prev => ({ ...prev, ownerName: result.ownerName }))

            // Also update the ownerName on canteen record
            await canteenService.updateCanteen(canteen.id, { ownerName: result.ownerName })
            setCanteen(prev => ({ ...prev, ownerName: result.ownerName }))

            setSaveSuccess('Owner details updated successfully!')
            setTimeout(() => { setShowEditOwner(false); setSaveSuccess('') }, 1200)
        } catch (err) {
            setSaveError(err.response?.data || 'Failed to update owner details.')
        } finally {
            setSaving(false)
        }
    }

    const validateCanteenForm = () => {
        const newErrors = {}
        const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/

        if (!editCanteenData.canteenName?.trim()) newErrors.canteenName = 'Canteen name is required'
        if (!editCanteenData.phoneNumber?.trim()) {
            newErrors.phoneNumber = 'Phone number is required'
        } else if (!phoneRegex.test(editCanteenData.phoneNumber.trim())) {
            newErrors.phoneNumber = 'Invalid Sri Lankan phone number (e.g., 0771234567 or +94771234567)'
        }

        if (editCanteenData.alternativeContactNumber?.trim() && !phoneRegex.test(editCanteenData.alternativeContactNumber.trim())) {
            newErrors.alternativeContactNumber = 'Invalid alternative phone number'
        }

        if (!editCanteenData.openingTime) newErrors.openingTime = 'Opening time is required'
        if (!editCanteenData.closingTime) newErrors.closingTime = 'Closing time is required'

        if (editCanteenData.openingTime && editCanteenData.closingTime) {
            if (editCanteenData.openingTime >= editCanteenData.closingTime) {
                newErrors.closingTime = 'Closing time must be after opening time'
            }
        }

        if (editCanteenData.seatingCapacity !== '' && parseInt(editCanteenData.seatingCapacity) < 0) {
            newErrors.seatingCapacity = 'Capacity cannot be negative'
        }

        if (editCanteenData.averagePreparationTime !== '' && parseInt(editCanteenData.averagePreparationTime) < 0) {
            newErrors.averagePreparationTime = 'Prep time cannot be negative'
        }

        if (!editCanteenData.operatingDays || editCanteenData.operatingDays.length === 0) {
            newErrors.operatingDays = 'Select at least one operating day'
        }

        if (!editCanteenData.cuisineTypes || editCanteenData.cuisineTypes.length === 0) {
            newErrors.cuisineTypes = 'Select at least one cuisine type'
        }

        return newErrors
    }

    const validateOwnerForm = () => {
        const newErrors = {}
        const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/

        if (!editOwnerData.ownerName?.trim()) newErrors.ownerName = 'Owner name is required'
        if (!editOwnerData.phoneNumber?.trim()) {
            newErrors.phoneNumber = 'Phone number is required'
        } else if (!phoneRegex.test(editOwnerData.phoneNumber.trim())) {
            newErrors.phoneNumber = 'Invalid Sri Lankan phone number'
        }

        return newErrors
    }

    const handleCanteenFieldChange = (e) => {
        const { name, value, type, checked } = e.target
        setEditCanteenData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingLogo(true)
        setSaveError('')
        try {
            const url = await imgbbService.uploadImage(file)
            setEditCanteenData(prev => ({ ...prev, logoUrl: url }))
        } catch (err) {
            setSaveError('Failed to upload logo. Please try again.')
        } finally {
            setUploadingLogo(false)
        }
    }

    const toggleCanteenArrayField = (field, value) => {
        setEditCanteenData(prev => {
            const arr = Array.isArray(prev[field]) ? [...prev[field]] : []
            return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
        })
    }

    const handleOwnerFieldChange = (e) => {
        const { name, value } = e.target
        setEditOwnerData(prev => ({ ...prev, [name]: value }))
    }

    // ─── Styling helpers ───
    const getStatusStyles = (status) => {
        switch (status) {
            case 'APPROVED': return { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' }
            case 'PENDING': return { bg: 'rgba(234,179,8,0.1)', text: '#facc15', border: 'rgba(234,179,8,0.2)' }
            case 'REJECTED': return { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)' }
            default: return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)' }
        }
    }

    const getOrderBadgeStyle = (status) => {
        switch (status) {
            case 'COMPLETED': return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)' };
            case 'READY': return { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' };
            case 'PREPARING': return { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' };
            default: return { bg: 'rgba(234,179,8,0.1)', text: '#facc15', border: 'rgba(234,179,8,0.2)' };
        }
    };

    // Derived Statistics
    const successfulOrders = orders.filter(o => o.paymentStatus === 'succeeded') || [];
    const totalOrdersCount = successfulOrders.length;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayRevenue = successfulOrders
        .filter(o => new Date(o.createdAt).getTime() >= todayStart)
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const recentlyCompleted = orders
        .filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'READY')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5);

    // ─── Shared modal styles ───
    const inputCls = "w-full px-4 py-3 bg-[#0d0d0d] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
    const labelCls = "block text-sm font-bold text-gray-400 mb-2"

    const EditButton = ({ onClick, title }) => (
        <button
            onClick={onClick}
            title={title}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all cursor-pointer"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        </button>
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <CanteenLayout pageTitle={`Welcome back, ${canteenOwner?.ownerName}!`} pageSubtitle={canteen?.canteenName || 'Manage your canteen efficiently'}>

            {/* Status Banner */}
            {canteen && canteen.status !== 'APPROVED' && (
                <div style={{
                    marginBottom: '32px',
                    borderRadius: '16px',
                    padding: '24px',
                    background: getStatusStyles(canteen.status).bg,
                    border: `1px solid ${getStatusStyles(canteen.status).border}`,
                    color: getStatusStyles(canteen.status).text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                    <div className="flex-shrink-0">
                        {canteen.status === 'APPROVED' && (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {canteen.status === 'PENDING' && (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {canteen.status === 'REJECTED' && (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg" style={{ color: 'white' }}>Registration Status: {canteen.status}</h3>
                        <p className="text-sm mt-1" style={{ color: getStatusStyles(canteen.status).text, opacity: 0.9 }}>
                            {canteen.status === 'PENDING' && "Your canteen registration is under review. We'll notify you once approved."}
                            {canteen.status === 'APPROVED' && "Your canteen is live and ready to accept orders!"}
                            {canteen.status === 'REJECTED' && "Your registration was not approved. Please contact support for details."}
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm font-medium">Total Orders</p>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                    </div>
                    <p className="text-4xl font-extrabold text-white mb-1 tracking-tight">{totalOrdersCount}</p>
                    <div style={{ color: totalOrdersCount > 0 ? '#22c55e' : 'rgba(255,255,255,0.3)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        {totalOrdersCount > 0 ? (
                            <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                <span>Active</span>
                            </>
                        ) : (
                            <span>Awaiting orders</span>
                        )}
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm font-medium">Today's Revenue</p>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <p className="text-4xl font-extrabold text-white mb-1 tracking-tight">Rs.{todayRevenue.toFixed(2)}</p>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <span>Earned today</span>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm font-medium">Avg Rating</p>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(234,179,8,0.1)', color: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </div>
                    </div>
                    <p className="text-4xl font-extrabold text-white mb-1 tracking-tight">{canteen?.rating?.toFixed(1) || '0.0'}</p>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <span>Based on {canteen?.totalRatings || 0} reviews</span>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm font-medium">Menu Items</p>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                    </div>
                    <p className="text-4xl font-extrabold text-white mb-1 tracking-tight">{menuItems.length}</p>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <span>Manage via Menu</span>
                    </div>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Canteen Information Panel */}
                {canteen ? (
                    <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px' }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', boxShadow: '0 0 10px rgba(249,115,22,0.5)' }}></span>
                                Canteen Details
                            </h3>
                            <EditButton onClick={openEditCanteen} title="Edit canteen details" />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                {canteen.logoUrl && (
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/[0.1] shadow-lg shadow-black/20 flex-shrink-0">
                                        <img src={canteen.logoUrl} alt="Canteen Logo" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 font-medium">Canteen Name</p>
                                    <p className="font-semibold text-gray-100 text-lg">{canteen.canteenName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 font-medium">Location</p>
                                    <p className="font-medium text-gray-200">{canteen.location} {canteen.campus && `(${canteen.campus})`}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 font-medium">Operating Hours</p>
                                    <p className="font-medium text-gray-200">{canteen.openingTime} - {canteen.closingTime}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1 font-medium">Contact Number</p>
                                <p className="font-medium text-gray-200">{canteen.phoneNumber}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1 font-medium">Description</p>
                                <p className="font-medium text-gray-300 leading-relaxed">{canteen.description}</p>
                            </div>

                            {canteen.cuisineTypes && canteen.cuisineTypes.length > 0 && (
                                <div className="pt-2">
                                    <p className="text-sm text-gray-500 mb-3 font-medium">Cuisine Types</p>
                                    <div className="flex flex-wrap gap-2">
                                        {canteen.cuisineTypes.map(cuisine => (
                                            <span key={cuisine} style={{
                                                padding: '6px 14px',
                                                background: 'rgba(249,115,22,0.08)',
                                                border: '1px solid rgba(249,115,22,0.15)',
                                                color: '#fdba74',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: 600
                                            }}>
                                                {cuisine}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                        {!canteenOwner?.canteenId ? (
                            <>
                                <div className="text-4xl mb-4">⚠️</div>
                                <p className="text-white font-bold mb-2">Canteen configuration missing</p>
                                <p className="text-gray-400 text-sm max-w-md text-center">Your account is not correctly linked to a canteen. Please contact support to resolve this linkage issue.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 border-2 border-white/10 border-t-orange-500 rounded-full animate-spin mb-4" />
                                <p className="text-gray-400">Loading canteen details...</p>
                                <p className="text-gray-600 text-xs mt-2">Canteen ID: {canteenOwner?.canteenId}</p>
                            </>
                        )}
                    </div>
                )}

                {/* Owner Details Panel */}
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px' }}>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }}></span>
                            Owner Details
                        </h3>
                        <EditButton onClick={openEditOwner} title="Edit owner details" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-orange-500/20">
                                {canteenOwner?.ownerName?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-100 text-lg">{canteenOwner?.ownerName}</p>
                                <p className="text-sm text-gray-500">Canteen Owner</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1 font-medium">Email Address</p>
                            <p className="font-medium text-gray-200">{canteenOwner?.email}</p>
                            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-1 font-medium">Phone Number</p>
                            <p className="font-medium text-gray-200">{canteen?.phoneNumber || '—'}</p>
                        </div>

                        {canteen?.alternativeContactNumber && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1 font-medium">Alternative Contact</p>
                                <p className="font-medium text-gray-200">{canteen.alternativeContactNumber}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Completed Orders */}
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }}></span>
                    Recent Completed Orders
                </h3>

                {recentlyCompleted.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'rgba(255,255,255,0.2)', minHeight: '180px' }}>
                        <div style={{ padding: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-lg font-medium text-gray-400">No recent activity</p>
                        <p className="text-sm mt-2 text-gray-500">Your latest completed orders will appear here.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentlyCompleted.map(order => {
                            const style = getOrderBadgeStyle(order.orderStatus);
                            return (
                                <div key={order.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-xl p-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-gray-200">#{order.id.slice(-6).toUpperCase()}</span>
                                            <span style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }} className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate max-w-[200px]">{order.customerName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-400">Rs.{order.totalAmount?.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {recentlyCompleted.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] text-center">
                        <button
                            onClick={() => navigate('/canteen/orders')}
                            className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors cursor-pointer"
                        >
                            View all orders →
                        </button>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════
                EDIT CANTEEN DETAILS MODAL
            ═══════════════════════════════════════════ */}
            {showEditCanteen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditCanteen(false)} />
                    <div className="relative bg-[#111] border border-white/[0.08] rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', boxShadow: '0 0 10px rgba(249,115,22,0.5)' }}></span>
                                Edit Canteen Details
                            </h2>
                            <button onClick={() => setShowEditCanteen(false)} className="text-gray-500 hover:text-white transition p-1 cursor-pointer">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {saveError && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                {saveError}
                            </div>
                        )}
                        {saveSuccess && (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/25 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {saveSuccess}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Logo Upload */}
                            <div>
                                <label className={labelCls}>Canteen Logo</label>
                                <div className="flex items-start gap-4">
                                    {editCanteenData.logoUrl && (
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/[0.1] flex-shrink-0">
                                            <img src={editCanteenData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setEditCanteenData(p => ({ ...p, logoUrl: '' }))}
                                                className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-700 cursor-pointer">×</button>
                                        </div>
                                    )}
                                    <label className={`flex-1 flex flex-col items-center justify-center px-4 py-8 bg-[#0d0d0d] rounded-2xl border-2 border-dashed border-white/[0.1] cursor-pointer hover:border-orange-500/50 transition-colors ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {uploadingLogo ? (
                                            <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-500">Click to update logo</span>
                                                <span className="text-xs text-gray-700 mt-1">PNG, JPG up to 5MB</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className={labelCls}>Canteen Name *</label>
                                <input type="text" name="canteenName" value={editCanteenData.canteenName} onChange={handleCanteenFieldChange} 
                                    className={`${inputCls} ${errors.canteenName ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} placeholder="e.g., The Campus Kitchen" />
                                {errors.canteenName && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                    <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.canteenName}</p>}
                            </div>

                            {/* Location */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Building / Location</label>
                                    <input type="text" name="location" value={editCanteenData.location} onChange={handleCanteenFieldChange} className={inputCls} placeholder="e.g., Block A" />
                                </div>
                                <div>
                                    <label className={labelCls}>Campus</label>
                                    <input type="text" name="campus" value={editCanteenData.campus} onChange={handleCanteenFieldChange} className={inputCls} placeholder="e.g., Main Campus" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Floor Number</label>
                                    <input type="text" name="floorNumber" value={editCanteenData.floorNumber} onChange={handleCanteenFieldChange} className={inputCls} placeholder="e.g., 2" />
                                </div>
                                <div>
                                    <label className={labelCls}>Room / Shop No.</label>
                                    <input type="text" name="roomNumber" value={editCanteenData.roomNumber} onChange={handleCanteenFieldChange} className={inputCls} placeholder="e.g., 205" />
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Phone Number *</label>
                                    <input type="tel" name="phoneNumber" value={editCanteenData.phoneNumber} onChange={handleCanteenFieldChange} 
                                        className={`${inputCls} ${errors.phoneNumber ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} placeholder="+94 77 000 0000" />
                                    {errors.phoneNumber && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                        <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.phoneNumber}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Alternative Contact</label>
                                    <input type="tel" name="alternativeContactNumber" value={editCanteenData.alternativeContactNumber} onChange={handleCanteenFieldChange} 
                                        className={`${inputCls} ${errors.alternativeContactNumber ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} placeholder="+94 77 000 0000" />
                                    {errors.alternativeContactNumber && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                        <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.alternativeContactNumber}</p>}
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Opening Time *</label>
                                    <input type="time" name="openingTime" value={editCanteenData.openingTime} onChange={handleCanteenFieldChange} 
                                        className={`${inputCls} ${errors.openingTime ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} style={{ colorScheme: 'dark' }} />
                                    {errors.openingTime && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                        <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.openingTime}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Closing Time *</label>
                                    <input type="time" name="closingTime" value={editCanteenData.closingTime} onChange={handleCanteenFieldChange} 
                                        className={`${inputCls} ${errors.closingTime ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} style={{ colorScheme: 'dark' }} />
                                    {errors.closingTime && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                        <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.closingTime}</p>}
                                </div>
                            </div>

                            {/* Operating Days */}
                            <div>
                                <label className={labelCls}>Operating Days *</label>
                                <div className={`flex flex-wrap gap-2 p-2 rounded-2xl transition-all ${errors.operatingDays ? 'bg-red-500/5 border border-red-500/20' : ''}`}>
                                    {allDays.map(day => {
                                        const selected = Array.isArray(editCanteenData.operatingDays) && editCanteenData.operatingDays.includes(day)
                                        return (
                                            <button key={day} type="button" onClick={() => toggleCanteenArrayField('operatingDays', day)}
                                                className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-black transition-all border ${selected ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-900/30' : 'bg-[#0d0d0d] text-gray-500 border-white/[0.07] hover:border-white/20'}`}>
                                                {day}
                                            </button>
                                        )
                                    })}
                                </div>
                                {errors.operatingDays && <p className="text-red-400 text-xs mt-2 ml-1 flex items-center gap-1.5 font-medium">
                                    <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.operatingDays}</p>}
                            </div>

                            {/* Operational */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Seating Capacity</label>
                                    <input type="number" name="seatingCapacity" value={editCanteenData.seatingCapacity} onChange={handleCanteenFieldChange} 
                                        className={`${inputCls} ${errors.seatingCapacity ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} placeholder="e.g., 50" />
                                    {errors.seatingCapacity && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                        <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.seatingCapacity}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Avg. Prep Time (min)</label>
                                    <input type="number" name="averagePreparationTime" value={editCanteenData.averagePreparationTime} onChange={handleCanteenFieldChange} 
                                        className={`${inputCls} ${errors.averagePreparationTime ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} placeholder="15" />
                                    {errors.averagePreparationTime && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                        <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.averagePreparationTime}</p>}
                                </div>
                            </div>

                            {/* Service options */}
                            <div className="flex gap-4">
                                {[
                                    { name: 'deliveryAvailable', label: 'Delivery Available', icon: '🛵' },
                                    { name: 'pickupAvailable', label: 'Pickup Available', icon: '🏃' },
                                ].map(opt => (
                                    <label key={opt.name} className={`flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-xl border transition-all ${editCanteenData[opt.name] ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[#0d0d0d] border-white/[0.07] hover:bg-white/[0.03]'}`}>
                                        <input type="checkbox" name={opt.name} checked={editCanteenData[opt.name] || false} onChange={handleCanteenFieldChange} className="hidden" />
                                        <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${editCanteenData[opt.name] ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}>
                                            {editCanteenData[opt.name] && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </span>
                                        <span className="text-lg">{opt.icon}</span>
                                        <span className="text-white font-bold text-sm">{opt.label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea name="description" value={editCanteenData.description} onChange={handleCanteenFieldChange} rows="3" placeholder="Describe your canteen..."
                                    className={`${inputCls} resize-none`} />
                            </div>

                            {/* Cuisine Types */}
                            <div>
                                <label className={labelCls}>Cuisine Types *</label>
                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 p-2 rounded-2xl transition-all ${errors.cuisineTypes ? 'bg-red-500/5 border border-red-500/20' : ''}`}>
                                    {cuisineOptions.map(c => {
                                        const selected = Array.isArray(editCanteenData.cuisineTypes) && editCanteenData.cuisineTypes.includes(c)
                                        return (
                                            <label key={c} className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${selected ? 'bg-orange-500/15 border-orange-500/40 text-orange-300' : 'bg-[#0d0d0d] border-white/[0.06] text-gray-500 hover:border-white/20'}`}>
                                                <input type="checkbox" checked={selected} onChange={() => toggleCanteenArrayField('cuisineTypes', c)} className="hidden" />
                                                <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${selected ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}>
                                                    {selected && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                </span>
                                                <span className="text-xs font-bold">{c}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                                {errors.cuisineTypes && <p className="text-red-400 text-xs mt-2 ml-1 flex items-center gap-1.5 font-medium">
                                    <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.cuisineTypes}</p>}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                                <button onClick={() => setShowEditCanteen(false)}
                                    className="px-6 py-3 bg-white/[0.06] border border-white/[0.08] text-white font-bold rounded-xl hover:bg-white/10 transition cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={handleSaveCanteen} disabled={saving}
                                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════
                EDIT OWNER DETAILS MODAL
            ═══════════════════════════════════════════ */}
            {showEditOwner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditOwner(false)} />
                    <div className="relative bg-[#111] border border-white/[0.08] rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }}></span>
                                Edit Owner Details
                            </h2>
                            <button onClick={() => setShowEditOwner(false)} className="text-gray-500 hover:text-white transition p-1 cursor-pointer">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {saveError && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                {saveError}
                            </div>
                        )}
                        {saveSuccess && (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/25 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {saveSuccess}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className={labelCls}>Email Address</label>
                                <input type="email" value={canteenOwner?.email || ''} disabled
                                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/[0.05] text-gray-500 rounded-xl text-sm cursor-not-allowed" />
                                <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                            </div>

                             <div>
                                <label className={labelCls}>Owner Name *</label>
                                <input type="text" name="ownerName" value={editOwnerData.ownerName} onChange={handleOwnerFieldChange} 
                                    className={`${inputCls} ${errors.ownerName ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} placeholder="Your full name" />
                                {errors.ownerName && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                    <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.ownerName}</p>}
                            </div>

                             <div>
                                <label className={labelCls}>Phone Number *</label>
                                <input type="tel" name="phoneNumber" value={editOwnerData.phoneNumber} onChange={handleOwnerFieldChange} 
                                    className={`${inputCls} ${errors.phoneNumber ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`} placeholder="+94 77 000 0000" />
                                {errors.phoneNumber && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium">
                                    <span className="w-1 h-1 rounded-full bg-red-400"></span>{errors.phoneNumber}</p>}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                                <button onClick={() => setShowEditOwner(false)}
                                    className="px-6 py-3 bg-white/[0.06] border border-white/[0.08] text-white font-bold rounded-xl hover:bg-white/10 transition cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={handleSaveOwner} disabled={saving}
                                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </CanteenLayout>
    )
}

export default CanteenDashboard
