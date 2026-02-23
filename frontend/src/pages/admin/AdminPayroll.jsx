import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import payrollService from '../../services/payrollService'
import AdminLayout from './AdminLayout'

function AdminPayroll() {
    const [payrolls, setPayrolls] = useState([])
    const [pendingPayrolls, setPendingPayrolls] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const all = await payrollService.getAllPayrolls().catch(() => [])
                setPayrolls(all || [])
                const pending = await payrollService.getPendingPayrolls().catch(() => [])
                setPendingPayrolls(pending || [])
            } catch (err) { console.error('Error:', err) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [])

    const getStatusStyle = (s) => {
        switch (s) {
            case 'DRAFT': return { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', border: 'rgba(156,163,175,0.3)' }
            case 'SUBMITTED': return { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' }
            case 'UNDER_REVIEW': return { bg: 'rgba(234,179,8,0.15)', text: '#facc15', border: 'rgba(234,179,8,0.3)' }
            case 'APPROVED': return { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' }
            case 'REJECTED': return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' }
            default: return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)' }
        }
    }

    if (loading) return (
        <AdminLayout pageTitle="Payroll Management">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        </AdminLayout>
    )

    const totalProcessed = payrolls.filter(p => p.status === 'APPROVED').reduce((s, p) => s + (p.totalNetPay || 0), 0)
    const totalPending = pendingPayrolls.reduce((s, p) => s + (p.totalNetPay || 0), 0)

    return (
        <AdminLayout pageTitle="Payroll Management" pageSubtitle="Review, approve, and manage platform payroll">
            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <Link to="/admin/payroll/config" style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.1)', color: '#f97316', textDecoration: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>⚙️ Payroll Configuration</Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Payrolls', value: payrolls.length, color: '#a855f7', icon: '📊' },
                    { label: 'Pending Review', value: pendingPayrolls.length, color: '#f59e0b', icon: '⏳' },
                    { label: 'Approved Total', value: `Rs.${totalProcessed.toLocaleString()}`, color: '#4ade80', icon: '✅' },
                    { label: 'Pending Total', value: `Rs.${totalPending.toLocaleString()}`, color: '#60a5fa', icon: '💳' }
                ].map(stat => (
                    <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600 }}>{stat.label}</p>
                            <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                        </div>
                        <p style={{ color: stat.color, fontSize: stat.label.includes('Total') && stat.label !== 'Total Payrolls' ? '18px' : '28px', fontWeight: 800 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Pending Payrolls */}
            {pendingPayrolls.length > 0 && (
                <>
                    <h3 style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⏳ Pending Review ({pendingPayrolls.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                        {pendingPayrolls.map(p => {
                            const st = getStatusStyle(p.status)
                            return (
                                <div key={p.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: '16px', padding: '20px', transition: 'all 0.3s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <p style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{p.canteenName || 'Canteen'}</p>
                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{p.periodStart} — {p.periodEnd} • {p.totalStaffCount} staff</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <p style={{ color: '#4ade80', fontWeight: 800, fontSize: '16px' }}>Rs.{p.totalNetPay?.toLocaleString()}</p>
                                            <Link to={`/admin/payroll/${p.id}`} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>Review →</Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* All Payrolls */}
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>All Payrolls</h3>
            {payrolls.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.2)' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)' }}>No payrolls submitted yet</p>
                </div>
            ) : (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                    {/* Table Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 1fr', gap: '12px', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Canteen', 'Period', 'Staff', 'Net Pay', 'Status', 'Action'].map(h => (
                            <p key={h} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</p>
                        ))}
                    </div>
                    {payrolls.map((p, idx) => {
                        const st = getStatusStyle(p.status)
                        return (
                            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 1fr', gap: '12px', padding: '14px 20px', alignItems: 'center', borderBottom: idx < payrolls.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <p style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{p.canteenName || 'Canteen'}</p>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{p.periodStart} → {p.periodEnd}</p>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{p.totalStaffCount}</p>
                                <p style={{ color: '#4ade80', fontSize: '13px', fontWeight: 700 }}>Rs.{p.totalNetPay?.toLocaleString()}</p>
                                <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, background: st.bg, color: st.text, border: `1px solid ${st.border}`, textAlign: 'center' }}>{p.status}</span>
                                <Link to={`/admin/payroll/${p.id}`} style={{ color: '#f97316', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>View</Link>
                            </div>
                        )
                    })}
                </div>
            )}
        </AdminLayout>
    )
}

export default AdminPayroll
