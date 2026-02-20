import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'
import canteenOwnerService from '../../services/canteenOwnerService'
import canteenAdminService from '../../services/canteenAdminService'
import AdminLayout from './AdminLayout'

function StatCard({ label, value, icon, color, subtitle }) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            transition: 'all 0.2s',
            cursor: 'default',
        }}
            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}
        >
            <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: `${color}1a`,
                border: `1px solid ${color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <span style={{ color, fontSize: '22px' }}>{icon}</span>
            </div>
            <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '28px', lineHeight: 1.1 }}>{value}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '3px' }}>{label}</div>
                {subtitle && <div style={{ color, fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>{subtitle}</div>}
            </div>
        </div>
    )
}

function QuickAction({ icon, label, description, gradient, onClick, badge }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '22px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                position: 'relative',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(249,115,22,0.3)'
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                fontSize: '20px',
            }}>
                {icon}
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '5px' }}>{label}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: 1.5 }}>{description}</div>
            {badge && (
                <span style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'linear-gradient(135deg, #f97316, #dc2626)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 800,
                    borderRadius: '999px',
                    padding: '2px 8px',
                }}>
                    {badge}
                </span>
            )}
        </button>
    )
}

function AdminDashboard() {
    const [pendingCount, setPendingCount] = useState(0)
    const [totalOwners, setTotalOwners] = useState(0)
    const [totalCanteens, setTotalCanteens] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const adminData = adminAuthService.getCurrentAdmin()
        if (!adminData) {
            navigate('/admin/login')
            return
        }
        fetchStats()
    }, [navigate])

    const fetchStats = async () => {
        try {
            const [pending, allOwners, allCanteens] = await Promise.all([
                canteenOwnerService.getPendingRegistrations(),
                canteenOwnerService.getAllCanteenOwners(),
                canteenAdminService.getAllCanteens()
            ])
            setPendingCount(pending.length)
            setTotalOwners(allOwners.length)
            setTotalCanteens(allCanteens.length)
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err)
        }
    }

    return (
        <AdminLayout
            pendingCount={pendingCount}
            pageTitle="Dashboard"
            pageSubtitle="Welcome back — here's what's happening on your platform"
        >
            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
            }}>
                <StatCard label="Canteen Owners" value={totalOwners} icon="👥" color="#3b82f6" />
                <StatCard label="Total Canteens" value={totalCanteens} icon="🏪" color="#f97316" />
                <StatCard
                    label="Pending Approvals"
                    value={pendingCount}
                    icon="⏳"
                    color="#eab308"
                    subtitle={pendingCount > 0 ? `${pendingCount} awaiting review` : 'All clear'}
                />
                <StatCard label="Total Orders" value="—" icon="📦" color="#8b5cf6" subtitle="Coming soon" />
            </div>

            {/* Section label */}
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>
                Quick Actions
            </div>

            {/* Quick Actions */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
            }}>
                <QuickAction
                    icon="👥"
                    label="Owner Management"
                    description="View and manage all registered canteen owners"
                    gradient="linear-gradient(135deg, #10b981, #059669)"
                    onClick={() => navigate('/admin/canteen-owners')}
                />
                <QuickAction
                    icon="🏪"
                    label="Canteen Management"
                    description="Manage canteen registrations and details"
                    gradient="linear-gradient(135deg, #f97316, #dc2626)"
                    onClick={() => navigate('/admin/canteens')}
                />
                <QuickAction
                    icon="✅"
                    label="Approval Queue"
                    description="Review pending canteen owner registrations"
                    gradient="linear-gradient(135deg, #eab308, #f97316)"
                    onClick={() => navigate('/admin/pending-approvals')}
                    badge={pendingCount > 0 ? `${pendingCount} pending` : null}
                />
                <QuickAction
                    icon="📊"
                    label="Analytics"
                    description="Platform statistics and performance"
                    gradient="linear-gradient(135deg, #3b82f6, #6366f1)"
                    onClick={() => { }}
                />
            </div>

            {/* System Health */}
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>
                System Health
            </div>
            <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '20px',
            }}>
                {[
                    { label: 'Database', status: 'Operational', color: '#22c55e' },
                    { label: 'API Server', status: 'Operational', color: '#22c55e' },
                    { label: 'Payment Gateway', status: 'Operational', color: '#22c55e' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: `${item.color}18`,
                            border: `1px solid ${item.color}35`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <span style={{ color: item.color, fontSize: '14px' }}>✓</span>
                        </div>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{item.label}</div>
                            <div style={{ color: item.color, fontSize: '13px', fontWeight: 700 }}>{item.status}</div>
                        </div>
                        <div style={{
                            marginLeft: 'auto',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: item.color,
                            boxShadow: `0 0 8px ${item.color}80`,
                        }} />
                    </div>
                ))}
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard
