import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import payrollService from '../../services/payrollService'
import AdminLayout from './AdminLayout'

function PayrollReview() {
    const { id } = useParams()
    const [payroll, setPayroll] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [comments, setComments] = useState('')

    useEffect(() => {
        const fetchPayroll = async () => {
            try {
                const data = await payrollService.getPayrollById(id)
                setPayroll(data)
            } catch (err) { console.error('Error:', err) }
            finally { setLoading(false) }
        }
        fetchPayroll()
    }, [id])

    const handleApprove = async () => {
        if (!confirm('Approve this payroll?')) return
        setProcessing(true)
        try {
            const updated = await payrollService.approvePayroll(id, 'admin', { comments: comments || 'Approved' })
            setPayroll(updated)
        } catch (err) { alert('Error: ' + (err.response?.data || err.message)) }
        finally { setProcessing(false) }
    }

    const handleReject = async () => {
        if (!comments.trim()) { alert('Please provide a reason for rejection'); return }
        if (!confirm('Reject this payroll?')) return
        setProcessing(true)
        try {
            const updated = await payrollService.rejectPayroll(id, 'admin', { comments })
            setPayroll(updated)
        } catch (err) { alert('Error: ' + (err.response?.data || err.message)) }
        finally { setProcessing(false) }
    }

    const getStatusStyle = (s) => {
        switch (s) {
            case 'DRAFT': return { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', border: 'rgba(156,163,175,0.3)' }
            case 'SUBMITTED': return { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' }
            case 'APPROVED': return { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' }
            case 'REJECTED': return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' }
            default: return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)' }
        }
    }

    if (loading) return (
        <AdminLayout pageTitle="Payroll Review">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        </AdminLayout>
    )

    if (!payroll) return (
        <AdminLayout pageTitle="Payroll Review">
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>Payroll not found</p>
                <Link to="/admin/payroll" style={{ color: '#f97316', textDecoration: 'none' }}>← Back</Link>
            </div>
        </AdminLayout>
    )

    const st = getStatusStyle(payroll.status)
    const canReview = payroll.status === 'SUBMITTED' || payroll.status === 'UNDER_REVIEW'

    return (
        <AdminLayout pageTitle="Payroll Review" pageSubtitle={`${payroll.canteenName || 'Canteen'} — ${payroll.periodStart} to ${payroll.periodEnd}`}>
            <Link to="/admin/payroll" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>← Back to Payroll</Link>

            {/* Summary */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ color: 'white', fontWeight: 800, fontSize: '20px', margin: 0 }}>{payroll.canteenName || 'Canteen Payroll'}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '4px' }}>Submitted by: {payroll.submittedBy || 'N/A'} • {payroll.totalStaffCount} staff members</p>
                    </div>
                    <span style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>{payroll.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                    {[
                        { label: 'Gross Pay', value: `Rs.${payroll.totalGrossPay?.toLocaleString()}`, color: 'white' },
                        { label: 'Deductions', value: `Rs.${payroll.totalDeductions?.toLocaleString()}`, color: '#f87171' },
                        { label: 'Net Pay', value: `Rs.${payroll.totalNetPay?.toLocaleString()}`, color: '#4ade80' },
                        { label: 'EPF Employer', value: `Rs.${payroll.totalEpfEmployer?.toLocaleString()}`, color: '#60a5fa' },
                        { label: 'ETF Employer', value: `Rs.${payroll.totalEtfEmployer?.toLocaleString()}`, color: '#818cf8' }
                    ].map(s => (
                        <div key={s.label} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>{s.label}</p>
                            <p style={{ color: s.color, fontSize: '17px', fontWeight: 800 }}>{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Staff Breakdown Table */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 700, margin: 0 }}>Staff Salary Breakdown</h3>
                </div>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Staff', 'Role', 'Days', 'Hours', 'Gross', 'Ded.', 'Net Pay'].map(h => (
                        <p key={h} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</p>
                    ))}
                </div>
                {payroll.items?.map((item, idx) => (
                    <div key={item.staffId} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '12px 20px', alignItems: 'center', borderBottom: idx < payroll.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <p style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{item.staffName}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{item.role}</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{item.daysWorked}</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{item.totalHoursWorked?.toFixed(1)}h</p>
                        <p style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Rs.{item.grossPay?.toLocaleString()}</p>
                        <p style={{ color: '#f87171', fontSize: '12px' }}>-Rs.{item.totalDeductions?.toLocaleString()}</p>
                        <p style={{ color: '#4ade80', fontSize: '12px', fontWeight: 700 }}>Rs.{item.netPay?.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Review Action */}
            {canReview && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>🔍 Review Action</h3>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Comments (required for rejection)</label>
                        <textarea value={comments} onChange={e => setComments(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                            placeholder="Add review comments..." />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleApprove} disabled={processing}
                            style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: processing ? 0.5 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(34,197,94,0.3)' }}>
                            {processing ? 'Processing...' : '✅ Approve Payroll'}
                        </button>
                        <button onClick={handleReject} disabled={processing}
                            style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: processing ? 0.5 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>
                            {processing ? 'Processing...' : '❌ Reject Payroll'}
                        </button>
                    </div>
                </div>
            )}

            {/* Past Review */}
            {payroll.reviewComments && !canReview && (
                <div style={{ padding: '16px 20px', borderRadius: '14px', background: payroll.status === 'REJECTED' ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)', border: `1px solid ${payroll.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'}` }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Review Comments</p>
                    <p style={{ color: 'white', fontSize: '14px' }}>{payroll.reviewComments}</p>
                </div>
            )}
        </AdminLayout>
    )
}

export default PayrollReview
