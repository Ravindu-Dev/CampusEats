import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import canteenService from '../services/canteenService'
import staffService from '../services/staffService'
import CanteenLayout from '../components/CanteenLayout'

const ROLES = ['COOK', 'HELPER', 'CASHIER', 'CLEANER', 'DELIVERY']
const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT']
const PAY_TYPES = ['HOURLY', 'MONTHLY']

const emptyStaff = { staffName: '', role: 'COOK', phone: '', nicNumber: '', employmentType: 'FULL_TIME', payType: 'MONTHLY', payRate: '', bankName: '', accountNumber: '', bankBranch: '', joinDate: '' }

function StaffManagement() {
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true)
    const [canteen, setCanteen] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [editingStaff, setEditingStaff] = useState(null)
    const [formData, setFormData] = useState({ ...emptyStaff })
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const navigate = useNavigate()

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) { navigate('/canteen/login'); return }
        const fetchData = async () => {
            try {
                if (owner.canteenId) {
                    const canteenData = await canteenService.getCanteenById(owner.canteenId).catch(() => null)
                    setCanteen(canteenData)
                    const staffData = await staffService.getStaffByCanteen(owner.canteenId).catch(() => [])
                    setStaff(staffData || [])
                }
            } catch (err) { console.error('Error:', err) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [navigate])

    const validateForm = () => {
        const newErrors = {}
        if (!formData.staffName || formData.staffName.trim().length < 3) {
            newErrors.staffName = 'Name must be at least 3 characters'
        }
        if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits'
        }
        if (!formData.nicNumber) {
            newErrors.nicNumber = 'NIC number is required'
        } else {
            const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/
            if (!nicRegex.test(formData.nicNumber)) {
                newErrors.nicNumber = 'Invalid NIC format (e.g., 123456789V or 12 digits)'
            }
        }
        if (!formData.payRate || parseFloat(formData.payRate) <= 0) {
            newErrors.payRate = 'Pay rate must be a positive number'
        }
        if (!formData.joinDate) {
            newErrors.joinDate = 'Join date is required'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) return
        setSaving(true)
        try {
            const data = { ...formData, canteenId: canteen?.id }
            if (editingStaff) {
                const updated = await staffService.updateStaff(editingStaff.id, data)
                setStaff(prev => prev.map(s => s.id === updated.id ? updated : s))
            } else {
                const created = await staffService.createStaff(data)
                setStaff(prev => [created, ...prev])
            }
            setShowModal(false)
            setEditingStaff(null)
            setFormData({ ...emptyStaff })
            setErrors({})
        } catch (err) { alert('Error saving staff: ' + err.message) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to deactivate this staff member?')) return
        try {
            await staffService.deleteStaff(id)
            setStaff(prev => prev.map(s => s.id === id ? { ...s, status: 'TERMINATED' } : s))
        } catch (err) { alert('Error: ' + err.message) }
    }

    const handleReactivate = async (id) => {
        try {
            const updated = await staffService.updateStaffStatus(id, 'ACTIVE')
            setStaff(prev => prev.map(s => s.id === id ? updated : s))
        } catch (err) { alert('Error: ' + err.message) }
    }

    const openEdit = (s) => {
        setEditingStaff(s)
        setErrors({})
        setFormData({ staffName: s.staffName, role: s.role, phone: s.phone || '', nicNumber: s.nicNumber || '', employmentType: s.employmentType, payType: s.payType, payRate: s.payRate, bankName: s.bankName || '', accountNumber: s.accountNumber || '', bankBranch: s.bankBranch || '', joinDate: s.joinDate || '' })
        setShowModal(true)
    }

    const filteredStaff = staff.filter(s => {
        const matchSearch = s.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) || s.role?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchFilter = filterStatus === 'ALL' || s.status === filterStatus
        return matchSearch && matchFilter
    })

    const activeCount = staff.filter(s => s.status === 'ACTIVE').length
    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACTIVE': return { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' }
            case 'INACTIVE': return { bg: 'rgba(234,179,8,0.1)', text: '#facc15', border: 'rgba(234,179,8,0.2)' }
            case 'TERMINATED': return { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)' }
            default: return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)' }
        }
    }

    const getRoleEmoji = (role) => {
        switch (role) {
            case 'COOK': return '👨‍🍳'
            case 'HELPER': return '🤝'
            case 'CASHIER': return '💳'
            case 'CLEANER': return '🧹'
            case 'DELIVERY': return '🚴'
            default: return '👤'
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div><p className="text-lg text-gray-400">Loading staff...</p></div>
        </div>
    )

    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', outline: 'none', colorScheme: 'dark' }

    return (
        <CanteenLayout pageTitle="Staff Management" pageSubtitle={`Manage your team — ${activeCount} active staff members`}>
            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                    <input type="text" placeholder="Search staff by name or role..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '40px' }} />
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}>🔍</span>
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', minWidth: '140px', cursor: 'pointer' }}>
                    <option value="ALL" style={{ background: '#1a1a1a', color: 'white' }}>All Status</option>
                    <option value="ACTIVE" style={{ background: '#1a1a1a', color: 'white' }}>Active</option>
                    <option value="INACTIVE" style={{ background: '#1a1a1a', color: 'white' }}>Inactive</option>
                    <option value="TERMINATED" style={{ background: '#1a1a1a', color: 'white' }}>Terminated</option>
                </select>
                <button onClick={() => { setEditingStaff(null); setFormData({ ...emptyStaff }); setErrors({}); setShowModal(true) }}
                    style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(168,85,247,0.3)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <span style={{ fontSize: '18px' }}>+</span> Add Staff
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[{ label: 'Total Staff', value: staff.length, color: '#a855f7' }, { label: 'Active', value: activeCount, color: '#4ade80' }, { label: 'Terminated', value: staff.filter(s => s.status === 'TERMINATED').length, color: '#f87171' }].map(stat => (
                    <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{stat.label}</p>
                        <p style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Staff Table */}
            {filteredStaff.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.2)' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>👥</p>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>No staff members yet</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>Click "Add Staff" to register your first team member</p>
                </div>
            ) : (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    {['Name', 'Role', 'Employment', 'Pay', 'Phone', 'Joined', 'Status', 'Actions'].map(header => (
                                        <th key={header} style={{
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            color: 'rgba(255,255,255,0.35)',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            letterSpacing: '0.8px',
                                            textTransform: 'uppercase',
                                            background: 'rgba(255,255,255,0.02)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map((s, index) => {
                                    const statusStyle = getStatusStyle(s.status)
                                    return (
                                        <tr key={s.id}
                                            style={{
                                                borderBottom: index < filteredStaff.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* Name */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '38px', height: '38px', borderRadius: '10px',
                                                        background: 'rgba(168,85,247,0.1)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '18px', flexShrink: 0
                                                    }}>
                                                        {getRoleEmoji(s.role)}
                                                    </div>
                                                    <div>
                                                        <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>{s.staffName}</p>
                                                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '2px 0 0' }}>{s.nicNumber || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                    background: 'rgba(168,85,247,0.08)', color: '#c084fc',
                                                    border: '1px solid rgba(168,85,247,0.15)', whiteSpace: 'nowrap'
                                                }}>
                                                    {s.role}
                                                </span>
                                            </td>

                                            {/* Employment Type */}
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                {s.employmentType?.replace('_', ' ')}
                                            </td>

                                            {/* Pay */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <p style={{ color: '#4ade80', fontSize: '13px', fontWeight: 700, margin: 0 }}>Rs.{s.payRate?.toFixed(2)}</p>
                                                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 600, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.payType}</p>
                                            </td>

                                            {/* Phone */}
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                {s.phone || '—'}
                                            </td>

                                            {/* Join Date */}
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                {s.joinDate || '—'}
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                                                    background: statusStyle.bg, color: statusStyle.text,
                                                    border: `1px solid ${statusStyle.border}`, letterSpacing: '0.5px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {s.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => openEdit(s)} style={{
                                                        padding: '6px 14px', borderRadius: '8px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)',
                                                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                                                    }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white' }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                                                    >Edit</button>
                                                    {s.status === 'ACTIVE' ? (
                                                        <button onClick={() => handleDelete(s.id)} style={{
                                                            padding: '6px 14px', borderRadius: '8px',
                                                            border: '1px solid rgba(239,68,68,0.2)',
                                                            background: 'rgba(239,68,68,0.05)', color: '#f87171',
                                                            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                                            transition: 'all 0.2s', whiteSpace: 'nowrap'
                                                        }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
                                                        >Deactivate</button>
                                                    ) : (
                                                        <button onClick={() => handleReactivate(s.id)} style={{
                                                            padding: '6px 14px', borderRadius: '8px',
                                                            border: '1px solid rgba(34,197,94,0.2)',
                                                            background: 'rgba(34,197,94,0.05)', color: '#4ade80',
                                                            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                                            transition: 'all 0.2s', whiteSpace: 'nowrap'
                                                        }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.12)' }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.05)' }}
                                                        >Reactivate</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                    onClick={() => setShowModal(false)}>
                    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>
                            {editingStaff ? '✏️ Edit Staff' : '➕ Add New Staff'}
                        </h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Staff Name *</label>
                                <input type="text" value={formData.staffName} onChange={e => {setFormData({ ...formData, staffName: e.target.value }); if(errors.staffName) setErrors(prev => { const n = { ...prev }; delete n.staffName; return n })}} style={{...inputStyle, borderColor: errors.staffName ? '#f87171' : 'rgba(255,255,255,0.1)'}} placeholder="Full name" />
                                {errors.staffName && <p style={{ color: '#f87171', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>{errors.staffName}</p>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Role *</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {ROLES.map(r => <option key={r} value={r} style={{ background: '#1a1a1a', color: 'white' }}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Employment Type</label>
                                    <select value={formData.employmentType} onChange={e => setFormData({ ...formData, employmentType: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {EMPLOYMENT_TYPES.map(t => <option key={t} value={t} style={{ background: '#1a1a1a', color: 'white' }}>{t.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Pay Type *</label>
                                    <select value={formData.payType} onChange={e => setFormData({ ...formData, payType: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {PAY_TYPES.map(t => <option key={t} value={t} style={{ background: '#1a1a1a', color: 'white' }}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Pay Rate (LKR) *</label>
                                    <input type="number" value={formData.payRate} onChange={e => {setFormData({ ...formData, payRate: e.target.value }); if(errors.payRate) setErrors(prev => { const n = { ...prev }; delete n.payRate; return n })}} style={{...inputStyle, borderColor: errors.payRate ? '#f87171' : 'rgba(255,255,255,0.1)'}} placeholder="0.00" />
                                    {errors.payRate && <p style={{ color: '#f87171', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>{errors.payRate}</p>}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Phone *</label>
                                    <input type="text" value={formData.phone} onChange={e => {setFormData({ ...formData, phone: e.target.value }); if(errors.phone) setErrors(prev => { const n = { ...prev }; delete n.phone; return n })}} style={{...inputStyle, borderColor: errors.phone ? '#f87171' : 'rgba(255,255,255,0.1)'}} placeholder="07X XXX XXXX" />
                                    {errors.phone && <p style={{ color: '#f87171', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>{errors.phone}</p>}
                                </div>
                                <div>
                                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>NIC Number *</label>
                                    <input type="text" value={formData.nicNumber} onChange={e => {setFormData({ ...formData, nicNumber: e.target.value }); if(errors.nicNumber) setErrors(prev => { const n = { ...prev }; delete n.nicNumber; return n })}} style={{...inputStyle, borderColor: errors.nicNumber ? '#f87171' : 'rgba(255,255,255,0.1)'}} placeholder="National ID" />
                                    {errors.nicNumber && <p style={{ color: '#f87171', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>{errors.nicNumber}</p>}
                                </div>
                            </div>
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Join Date *</label>
                                <input type="date" value={formData.joinDate} onChange={e => {setFormData({ ...formData, joinDate: e.target.value }); if(errors.joinDate) setErrors(prev => { const n = { ...prev }; delete n.joinDate; return n })}} style={{...inputStyle, borderColor: errors.joinDate ? '#f87171' : 'rgba(255,255,255,0.1)'}} />
                                {errors.joinDate && <p style={{ color: '#f87171', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>{errors.joinDate}</p>}
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>BANK DETAILS (Optional)</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <input type="text" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} style={inputStyle} placeholder="Bank Name" />
                                    <input type="text" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} style={inputStyle} placeholder="Account No." />
                                    <input type="text" value={formData.bankBranch} onChange={e => setFormData({ ...formData, bankBranch: e.target.value })} style={inputStyle} placeholder="Branch" />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving || !formData.staffName || !formData.payRate || !formData.phone || !formData.nicNumber || !formData.joinDate || Object.values(errors).some(v => v)}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px', opacity: saving || !formData.staffName || !formData.payRate || !formData.phone || !formData.nicNumber || !formData.joinDate || Object.values(errors).some(v => v) ? 0.5 : 1 }}>
                                {saving ? 'Saving...' : editingStaff ? 'Update Staff' : 'Add Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CanteenLayout>
    )
}

export default StaffManagement
