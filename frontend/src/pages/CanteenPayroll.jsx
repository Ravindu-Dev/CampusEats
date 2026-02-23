import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import canteenService from '../services/canteenService'
import payrollService from '../services/payrollService'
import CanteenLayout from '../components/CanteenLayout'

function CanteenPayroll() {
    const [payrolls, setPayrolls] = useState([])
    const [loading, setLoading] = useState(true)
    const [canteen, setCanteen] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [periodStart, setPeriodStart] = useState('')
    const [periodEnd, setPeriodEnd] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) { navigate('/canteen/login'); return }
        const fetchData = async () => {
            try {
                if (owner.canteenId) {
                    const canteenData = await canteenService.getCanteenById(owner.canteenId).catch(() => null)
                    setCanteen(canteenData)
                    const data = await payrollService.getPayrollsByCanteen(owner.canteenId).catch(() => [])
                    setPayrolls(data || [])
                }
            } catch (err) { console.error('Error:', err) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [navigate])

    const handleGenerate = async () => {
        if (!periodStart || !periodEnd) { alert('Please select both start and end dates'); return }
        setGenerating(true)
        try {
            const payroll = await payrollService.generatePayroll({ canteenId: canteen.id, periodStart, periodEnd })
            setPayrolls(prev => [payroll, ...prev])
            setShowModal(false)
            setPeriodStart('')
            setPeriodEnd('')
        } catch (err) { alert('Error: ' + (err.response?.data || err.message)) }
        finally { setGenerating(false) }
    }

    const handleSubmit = async (id) => {
        if (!confirm('Submit this payroll for admin review?')) return
        try {
            const owner = canteenAuthService.getCurrentCanteenOwner()
            const updated = await payrollService.submitPayroll(id, owner?.ownerName)
            setPayrolls(prev => prev.map(p => p.id === id ? updated : p))
        } catch (err) { alert('Error: ' + (err.response?.data || err.message)) }
    }

    const getStatusStyle = (s) => {
        switch (s) {
            case 'DRAFT': return { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', border: 'rgba(156,163,175,0.3)', label: '📝 Draft' }
            case 'SUBMITTED': return { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)', label: '📤 Submitted' }
            case 'UNDER_REVIEW': return { bg: 'rgba(234,179,8,0.15)', text: '#facc15', border: 'rgba(234,179,8,0.3)', label: '🔍 Under Review' }
            case 'APPROVED': return { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)', label: '✅ Approved' }
            case 'REJECTED': return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)', label: '❌ Rejected' }
            default: return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)', label: s }
        }
    }

    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', outline: 'none' }

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div><p className="text-lg text-gray-400">Loading payroll...</p></div>
        </div>
    )

    const totalApproved = payrolls.filter(p => p.status === 'APPROVED').reduce((s, p) => s + (p.totalNetPay || 0), 0)

    return (
        <CanteenLayout pageTitle="Payroll Management" pageSubtitle="Generate, review, and submit payroll for your staff">
            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button onClick={() => setShowModal(true)}
                    style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', transition: 'all 0.2s' }}>
                    + Generate Payroll
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Payrolls', value: payrolls.length, color: '#a855f7' },
                    { label: 'Pending Review', value: payrolls.filter(p => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length, color: '#f59e0b' },
                    { label: 'Approved', value: payrolls.filter(p => p.status === 'APPROVED').length, color: '#4ade80' },
                    { label: 'Total Approved Payout', value: `Rs.${totalApproved.toLocaleString()}`, color: '#10b981' }
                ].map(stat => (
                    <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{stat.label}</p>
                        <p style={{ color: stat.color, fontSize: stat.label === 'Total Approved Payout' ? '18px' : '28px', fontWeight: 800 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Payroll List */}
            {payrolls.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.2)' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>💰</p>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>No payrolls yet</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>Click "Generate Payroll" to create your first payroll run</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {payrolls.map(p => {
                        const st = getStatusStyle(p.status)
                        return (
                            <div key={p.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', transition: 'all 0.3s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                                            {p.periodStart} — {p.periodEnd}
                                        </p>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                            {p.totalStaffCount} staff • Created {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>{st.label}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', margin: '16px 0', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 600 }}>Gross Pay</p><p style={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>Rs.{p.totalGrossPay?.toLocaleString()}</p></div>
                                    <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 600 }}>Deductions</p><p style={{ color: '#f87171', fontSize: '16px', fontWeight: 700 }}>Rs.{p.totalDeductions?.toLocaleString()}</p></div>
                                    <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 600 }}>Net Pay</p><p style={{ color: '#4ade80', fontSize: '16px', fontWeight: 700 }}>Rs.{p.totalNetPay?.toLocaleString()}</p></div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <Link to={`/canteen/payroll/${p.id}`} style={{ padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}>View Details</Link>
                                    {p.status === 'DRAFT' && (
                                        <button onClick={() => handleSubmit(p.id)}
                                            style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Submit for Review</button>
                                    )}
                                </div>
                                {p.reviewComments && (
                                    <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '10px', background: p.status === 'REJECTED' ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)', border: `1px solid ${p.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'}` }}>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}><strong>Admin Review:</strong> {p.reviewComments}</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Generate Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                    onClick={() => setShowModal(false)}>
                    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px' }}
                        onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>💰 Generate Payroll</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '24px' }}>Select the pay period to calculate salaries</p>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Period Start</label>
                                <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Period End</label>
                                <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                            <button onClick={handleGenerate} disabled={generating || !periodStart || !periodEnd}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px', opacity: generating || !periodStart || !periodEnd ? 0.5 : 1 }}>
                                {generating ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CanteenLayout>
    )
}

export default CanteenPayroll
