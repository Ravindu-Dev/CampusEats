import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import payrollService from '../../services/payrollService'
import AdminLayout from './AdminLayout'

function PayrollConfig() {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({})

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await payrollService.getConfig()
                setConfig(data)
                setFormData(data)
            } catch (err) { console.error('Error:', err) }
            finally { setLoading(false) }
        }
        fetchConfig()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await payrollService.updateConfig({
                payPeriodType: formData.payPeriodType,
                overtimeMultiplier: Number(formData.overtimeMultiplier),
                epfEmployeeRate: Number(formData.epfEmployeeRate),
                epfEmployerRate: Number(formData.epfEmployerRate),
                etfRate: Number(formData.etfRate),
                standardWorkHoursPerDay: Number(formData.standardWorkHoursPerDay),
                defaultMealAllowance: Number(formData.defaultMealAllowance),
                defaultTransportAllowance: Number(formData.defaultTransportAllowance),
            })
            setConfig(updated)
            setFormData(updated)
            alert('Configuration saved successfully!')
        } catch (err) { alert('Error saving: ' + err.message) }
        finally { setSaving(false) }
    }

    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', outline: 'none' }

    if (loading) return (
        <AdminLayout pageTitle="Payroll Configuration">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        </AdminLayout>
    )

    return (
        <AdminLayout pageTitle="Payroll Configuration" pageSubtitle="Configure platform-wide payroll policies and rates">
            <Link to="/admin/payroll" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>← Back to Payroll</Link>

            <div style={{ maxWidth: '700px' }}>
                {/* Pay Period */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>📅 Pay Period</h3>
                    <div>
                        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Pay Period Type</label>
                        <select value={formData.payPeriodType || 'MONTHLY'} onChange={e => setFormData({ ...formData, payPeriodType: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="MONTHLY">Monthly</option>
                            <option value="BI_WEEKLY">Bi-Weekly</option>
                            <option value="WEEKLY">Weekly</option>
                        </select>
                    </div>
                </div>

                {/* Work Hours & Overtime */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>⏰ Work Hours & Overtime</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Standard Hours/Day</label>
                            <input type="number" value={formData.standardWorkHoursPerDay || 8} onChange={e => setFormData({ ...formData, standardWorkHoursPerDay: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Overtime Multiplier</label>
                            <input type="number" step="0.1" value={formData.overtimeMultiplier || 1.5} onChange={e => setFormData({ ...formData, overtimeMultiplier: e.target.value })} style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* EPF/ETF */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🏛️ EPF / ETF Rates (%)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>EPF Employee (%)</label>
                            <input type="number" step="0.1" value={formData.epfEmployeeRate || 8} onChange={e => setFormData({ ...formData, epfEmployeeRate: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>EPF Employer (%)</label>
                            <input type="number" step="0.1" value={formData.epfEmployerRate || 12} onChange={e => setFormData({ ...formData, epfEmployerRate: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>ETF (%)</label>
                            <input type="number" step="0.1" value={formData.etfRate || 3} onChange={e => setFormData({ ...formData, etfRate: e.target.value })} style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* Allowances */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>💵 Default Allowances (per day, LKR)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Meal Allowance</label>
                            <input type="number" value={formData.defaultMealAllowance || 0} onChange={e => setFormData({ ...formData, defaultMealAllowance: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Transport Allowance</label>
                            <input type="number" value={formData.defaultTransportAllowance || 0} onChange={e => setFormData({ ...formData, defaultTransportAllowance: e.target.value })} style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* Save */}
                <button onClick={handleSave} disabled={saving}
                    style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(249,115,22,0.3)', opacity: saving ? 0.6 : 1, transition: 'all 0.2s' }}>
                    {saving ? 'Saving...' : '💾 Save Configuration'}
                </button>
            </div>
        </AdminLayout>
    )
}

export default PayrollConfig
