import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import canteenService from '../services/canteenService'
import orderService from '../services/orderService'
import { menuItemService } from '../services/menuItemService'
import CanteenLayout from '../components/CanteenLayout'

function CanteenDashboard() {
    const [canteenOwner, setCanteenOwner] = useState(null)
    const [canteen, setCanteen] = useState(null)
    const [orders, setOrders] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

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
                        canteenService.getCanteenById(owner.canteenId).catch(() => null),
                        orderService.getCanteenOrders(owner.canteenId).catch(() => []),
                        menuItemService.getMenuItems(owner.canteenId).catch(() => [])
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

    // Calculate Today's Revenue
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayRevenue = successfulOrders
        .filter(o => new Date(o.createdAt).getTime() >= todayStart)
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Recent Completed Orders
    const recentlyCompleted = orders
        .filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'READY')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5);

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
            <div className="grid md:grid-cols-2 gap-6">
                {/* Canteen Information Panel */}
                {canteen ? (
                    <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px' }}>
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', boxShadow: '0 0 10px rgba(249,115,22,0.5)' }}></span>
                            Canteen Details
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1 font-medium">Canteen Name</p>
                                <p className="font-semibold text-gray-100 text-lg">{canteen.canteenName}</p>
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
                    <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p className="text-gray-400">Loading canteen details...</p>
                    </div>
                )}

                {/* Pending Area / Recent Activity */}
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }}></span>
                        Recent Completed Orders
                    </h3>

                    {recentlyCompleted.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'rgba(255,255,255,0.2)' }}>
                            <div style={{ padding: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', marginBottom: '16px' }}>
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-lg font-medium text-gray-400">No recent activity</p>
                            <p className="text-sm mt-2 text-gray-500">Your latest completed orders will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '400px' }}>
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
                                className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
                            >
                                View all orders →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </CanteenLayout>
    )
}

export default CanteenDashboard
