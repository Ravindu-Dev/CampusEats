import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'
import canteenOwnerService from '../../services/canteenOwnerService'
import AdminLayout from './AdminLayout'

function AllCanteenOwners() {
    const [owners, setOwners] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const adminData = adminAuthService.getCurrentAdmin()
        if (!adminData) {
            navigate('/admin/login')
            return
        }
        fetchAllOwners()
    }, [navigate])

    const fetchAllOwners = async () => {
        try {
            setLoading(true)
            const data = await canteenOwnerService.getAllCanteenOwners()
            setOwners(data)
            setError(null)
        } catch (err) {
            setError('Failed to fetch canteen owners')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filteredOwners = owners.filter(owner =>
        owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const statusColors = {
        APPROVED: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
        PENDING: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#eab308' },
        REJECTED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
    }

    const getStatusStyle = (status) => statusColors[status] || { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)' }

    return (
        <AdminLayout pageTitle="Canteen Owners" pageSubtitle="View all registered canteen owners in the system">
            {/* Search + count bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                flexWrap: 'wrap',
            }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
                    <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            paddingLeft: '38px',
                            paddingRight: '16px',
                            paddingTop: '10px',
                            paddingBottom: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                        onFocus={e => { e.target.style.border = '1px solid rgba(249,115,22,0.5)' }}
                        onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginLeft: 'auto' }}>
                    {filteredOwners.length} owner{filteredOwners.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(249,115,22,0.2)', borderTop: '3px solid #f97316', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : error ? (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '20px', color: '#f87171' }}>
                    {error}
                </div>
            ) : (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    {['Name', 'Email', 'Phone', 'Status', 'Joined'].map(col => (
                                        <th key={col} style={{
                                            padding: '14px 20px',
                                            textAlign: 'left',
                                            color: 'rgba(255,255,255,0.3)',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                        }}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOwners.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>
                                            No owners found
                                        </td>
                                    </tr>
                                ) : filteredOwners.map((owner, i) => {
                                    const s = getStatusStyle(owner.approvalStatus)
                                    return (
                                        <tr key={owner.id} style={{
                                            borderBottom: i < filteredOwners.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                            transition: 'background 0.15s',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                        >
                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #f97316, #dc2626)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        color: 'white',
                                                        fontWeight: 800,
                                                        flexShrink: 0,
                                                    }}>
                                                        {owner.ownerName[0].toUpperCase()}
                                                    </div>
                                                    <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{owner.ownerName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{owner.email}</td>
                                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{owner.phoneNumber}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '999px',
                                                    background: s.bg,
                                                    border: `1px solid ${s.border}`,
                                                    color: s.text,
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.5px',
                                                }}>
                                                    {owner.approvalStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                                                {new Date(owner.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AdminLayout>
    )
}

export default AllCanteenOwners
