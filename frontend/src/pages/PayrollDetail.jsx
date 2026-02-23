import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import payrollService from '../services/payrollService'
import CanteenLayout from '../components/CanteenLayout'

function PayrollDetail() {
    const { id } = useParams()
    const [payroll, setPayroll] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPayroll = async () => {
            try {
                const data = await payrollService.getPayrollById(id)
                setPayroll(data)
            } catch (err) { console.error('Error:', err); alert('Payroll not found') }
            finally { setLoading(false) }
        }
        fetchPayroll()
    }, [id])

    const handleDownloadPayslip = async (staffId, staffName) => {
        setDownloading(staffId)
        try { await payrollService.downloadPayslip(id, staffId) }
        catch (err) { alert('Error downloading payslip: ' + err.message) }
        finally { setDownloading(null) }
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
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div><p className="text-lg text-gray-400">Loading payroll...</p></div>
        </div>
    )

    if (!payroll) return (
        <CanteenLayout pageTitle="Payroll Detail">
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>Payroll not found</p>
                <Link to="/canteen/payroll" style={{ color: '#10b981', textDecoration: 'none' }}>← Back to Payroll</Link>
            </div>
        </CanteenLayout>
    )

    const st = getStatusStyle(payroll.status)

    return (
        <CanteenLayout pageTitle="Payroll Details" pageSubtitle={`${payroll.periodStart} — ${payroll.periodEnd}`}>
            {/* Back link */}
            <Link to="/canteen/payroll" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>← Back to Payroll</Link>

            {/* Header Summary */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ color: 'white', fontWeight: 800, fontSize: '20px', margin: 0 }}>{payroll.canteenName || 'Payroll'}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '4px' }}>{payroll.periodStart} — {payroll.periodEnd} • {payroll.totalStaffCount} staff</p>
                    </div>
                    <span style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>{payroll.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                    {[
                        { label: 'Gross Pay', value: `Rs.${payroll.totalGrossPay?.toLocaleString()}`, color: 'white' },
                        { label: 'Total Deductions', value: `Rs.${payroll.totalDeductions?.toLocaleString()}`, color: '#f87171' },
                        { label: 'Net Pay', value: `Rs.${payroll.totalNetPay?.toLocaleString()}`, color: '#4ade80' },
                        { label: 'EPF (Employer)', value: `Rs.${payroll.totalEpfEmployer?.toLocaleString()}`, color: '#60a5fa' },
                        { label: 'ETF (Employer)', value: `Rs.${payroll.totalEtfEmployer?.toLocaleString()}`, color: '#818cf8' }
                    ].map(s => (
                        <div key={s.label} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>{s.label}</p>
                            <p style={{ color: s.color, fontSize: '18px', fontWeight: 800 }}>{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Per-Staff Breakdown */}
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Staff Salary Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {payroll.items?.map(item => (
                    <div key={item.staffId} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', transition: 'all 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                                <p style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{item.staffName}</p>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{item.role} • {item.payType} • Rs.{item.payRate?.toFixed(2)}{item.payType === 'HOURLY' ? '/hr' : '/mo'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: '#4ade80', fontWeight: 800, fontSize: '18px' }}>Rs.{item.netPay?.toLocaleString()}</p>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>Net Pay</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '12px' }}>
                            <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>Days Worked</p><p style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{item.daysWorked}</p></div>
                            <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>Hours</p><p style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{item.totalHoursWorked?.toFixed(1)}h</p></div>
                            <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>Overtime</p><p style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>{item.overtimeHours?.toFixed(1)}h</p></div>
                            <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>Basic Pay</p><p style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>Rs.{item.basicPay?.toLocaleString()}</p></div>
                            <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>OT Pay</p><p style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>Rs.{item.overtimePay?.toLocaleString()}</p></div>
                            <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>Gross Pay</p><p style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>Rs.{item.grossPay?.toLocaleString()}</p></div>
                            <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>EPF</p><p style={{ color: '#f87171', fontSize: '13px', fontWeight: 700 }}>-Rs.{item.epfEmployee?.toLocaleString()}</p></div>
                            <div><p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600 }}>Total Ded.</p><p style={{ color: '#f87171', fontSize: '13px', fontWeight: 700 }}>-Rs.{item.totalDeductions?.toLocaleString()}</p></div>
                        </div>
                        {payroll.status === 'APPROVED' && (
                            <button onClick={() => handleDownloadPayslip(item.staffId, item.staffName)} disabled={downloading === item.staffId}
                                style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', opacity: downloading === item.staffId ? 0.5 : 1, transition: 'all 0.2s' }}>
                                {downloading === item.staffId ? '⏳ Downloading...' : '📄 Download Payslip PDF'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Review Comments */}
            {payroll.reviewComments && (
                <div style={{ marginTop: '24px', padding: '16px 20px', borderRadius: '14px', background: payroll.status === 'REJECTED' ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)', border: `1px solid ${payroll.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'}` }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Admin Review Comments</p>
                    <p style={{ color: 'white', fontSize: '14px' }}>{payroll.reviewComments}</p>
                </div>
            )}
        </CanteenLayout>
    )
}

export default PayrollDetail
