import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import canteenService from '../services/canteenService'
import staffService from '../services/staffService'
import attendanceService from '../services/attendanceService'
import CanteenLayout from '../components/CanteenLayout'

function AttendanceManagement() {
    const [staff, setStaff] = useState([])
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [canteen, setCanteen] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [saving, setSaving] = useState(false)
    const [entries, setEntries] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) { navigate('/canteen/login'); return }
        const fetchData = async () => {
            try {
                if (owner.canteenId) {
                    const canteenData = await canteenService.getCanteenById(owner.canteenId).catch(() => null)
                    setCanteen(canteenData)
                    const staffData = await staffService.getActiveStaffByCanteen(owner.canteenId).catch(() => [])
                    setStaff(staffData || [])
                }
            } catch (err) { console.error('Error:', err) }
            finally { setLoading(false) }
        }
        fetchData()
    }, [navigate])

    useEffect(() => {
        if (canteen?.id) fetchAttendance()
    }, [selectedDate, canteen])

    const fetchAttendance = async () => {
        try {
            const data = await attendanceService.getAttendanceByCanteenAndDate(canteen.id, selectedDate)
            setAttendance(data || [])
            const map = {}
            data?.forEach(a => {
                map[a.staffId] = { checkInTime: a.checkInTime || '', checkOutTime: a.checkOutTime || '', dayType: a.dayType || 'PRESENT', notes: a.notes || '' }
            })
            setEntries(map)
        } catch (err) { console.error('Error fetching attendance:', err) }
    }

    const handleEntryChange = (staffId, field, value) => {
        setEntries(prev => ({ ...prev, [staffId]: { ...(prev[staffId] || { checkInTime: '', checkOutTime: '', dayType: 'PRESENT', notes: '' }), [field]: value } }))
    }

    const handleSaveAll = async () => {
        setSaving(true)
        try {
            const bulkEntries = Object.entries(entries).map(([staffId, data]) => ({
                staffId, checkInTime: data.checkInTime, checkOutTime: data.checkOutTime, dayType: data.dayType, notes: data.notes
            }))
            await attendanceService.logBulkAttendance({ canteenId: canteen.id, date: selectedDate, entries: bulkEntries })
            await fetchAttendance()
        } catch (err) { alert('Error saving attendance: ' + err.message) }
        finally { setSaving(false) }
    }

    const markAll = (type) => {
        const newEntries = {}
        staff.forEach(s => { newEntries[s.id] = { ...(entries[s.id] || { checkInTime: '', checkOutTime: '', notes: '' }), dayType: type } })
        setEntries(newEntries)
    }

    const getRoleEmoji = (role) => {
        switch (role) { case 'COOK': return '👨‍🍳'; case 'HELPER': return '🤝'; case 'CASHIER': return '💳'; case 'CLEANER': return '🧹'; case 'DELIVERY': return '🚴'; default: return '👤' }
    }

    const getDayTypeStyle = (type) => {
        switch (type) {
            case 'PRESENT': return { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' }
            case 'ABSENT': return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' }
            case 'HALF_DAY': return { bg: 'rgba(234,179,8,0.15)', text: '#facc15', border: 'rgba(234,179,8,0.3)' }
            case 'LEAVE': return { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' }
            default: return { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)' }
        }
    }

    const presentCount = Object.values(entries).filter(e => e.dayType === 'PRESENT').length
    const absentCount = Object.values(entries).filter(e => e.dayType === 'ABSENT').length
    const inputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '13px', outline: 'none' }

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div><p className="text-lg text-gray-400">Loading attendance...</p></div>
        </div>
    )

    return (
        <CanteenLayout pageTitle="Attendance Management" pageSubtitle="Log daily work hours and manage attendance">
            {/* Date Selector & Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    style={{ ...inputStyle, fontSize: '14px', fontWeight: 600, minWidth: '180px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['PRESENT', 'ABSENT', 'LEAVE'].map(type => {
                        const s = getDayTypeStyle(type)
                        return (
                            <button key={type} onClick={() => markAll(type)}
                                style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${s.border}`, background: s.bg, color: s.text, fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                                Mark All {type.replace('_', ' ')}
                            </button>
                        )
                    })}
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <button onClick={handleSaveAll} disabled={saving}
                        style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(6,182,212,0.3)', opacity: saving ? 0.6 : 1, transition: 'all 0.2s' }}>
                        {saving ? 'Saving...' : '💾 Save Attendance'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {[{ label: 'Total Staff', value: staff.length, color: '#a855f7' }, { label: 'Present', value: presentCount, color: '#4ade80' }, { label: 'Absent', value: absentCount, color: '#f87171' }, { label: 'Date', value: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), color: '#06b6d4' }].map(stat => (
                    <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>{stat.label}</p>
                        <p style={{ color: stat.color, fontSize: stat.label === 'Date' ? '14px' : '24px', fontWeight: 800 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Attendance Table */}
            {staff.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.2)' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📅</p>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>No active staff members</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>Add staff in the Staff Management page first</p>
                </div>
            ) : (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', gap: '12px', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Staff Member', 'Check In', 'Check Out', 'Status', 'Notes'].map(h => (
                            <p key={h} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</p>
                        ))}
                    </div>
                    {/* Rows */}
                    {staff.map((s, idx) => {
                        const entry = entries[s.id] || { checkInTime: '', checkOutTime: '', dayType: 'PRESENT', notes: '' }
                        const existing = attendance.find(a => a.staffId === s.id)
                        return (
                            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', gap: '12px', padding: '14px 20px', alignItems: 'center', borderBottom: idx < staff.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>{getRoleEmoji(s.role)}</span>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{s.staffName}</p>
                                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{s.role}
                                            {existing && <span style={{ color: '#4ade80', marginLeft: '8px' }}>• {existing.totalHours?.toFixed(1)}h worked</span>}
                                        </p>
                                    </div>
                                </div>
                                <input type="time" value={entry.checkInTime} onChange={e => handleEntryChange(s.id, 'checkInTime', e.target.value)}
                                    disabled={entry.dayType === 'ABSENT' || entry.dayType === 'LEAVE'}
                                    style={{ ...inputStyle, opacity: entry.dayType === 'ABSENT' || entry.dayType === 'LEAVE' ? 0.3 : 1 }} />
                                <input type="time" value={entry.checkOutTime} onChange={e => handleEntryChange(s.id, 'checkOutTime', e.target.value)}
                                    disabled={entry.dayType === 'ABSENT' || entry.dayType === 'LEAVE'}
                                    style={{ ...inputStyle, opacity: entry.dayType === 'ABSENT' || entry.dayType === 'LEAVE' ? 0.3 : 1 }} />
                                <select value={entry.dayType} onChange={e => handleEntryChange(s.id, 'dayType', e.target.value)}
                                    style={{ ...inputStyle, cursor: 'pointer', color: getDayTypeStyle(entry.dayType).text, background: getDayTypeStyle(entry.dayType).bg, borderColor: getDayTypeStyle(entry.dayType).border }}>
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="HALF_DAY">Half Day</option>
                                    <option value="LEAVE">Leave</option>
                                </select>
                                <input type="text" placeholder="Optional notes..." value={entry.notes} onChange={e => handleEntryChange(s.id, 'notes', e.target.value)} style={inputStyle} />
                            </div>
                        )
                    })}
                </div>
            )}
        </CanteenLayout>
    )
}

export default AttendanceManagement
