import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'
import canteenOwnerService from '../../services/canteenOwnerService'
import AdminLayout from './AdminLayout'

function PendingApprovals() {
    const [pendingOwners, setPendingOwners] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [selectedOwner, setSelectedOwner] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const adminData = adminAuthService.getCurrentAdmin()
        if (!adminData) {
            navigate('/admin/login')
            return
        }
        fetchPendingRegistrations()
    }, [navigate])

    const fetchPendingRegistrations = async () => {
        try {
            setLoading(true)
            const data = await canteenOwnerService.getPendingRegistrations()
            setPendingOwners(data)
            setError(null)
        } catch (err) {
            setError('Failed to fetch pending registrations')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (ownerId, ownerName) => {
        if (!confirm(`Approve ${ownerName}?`)) return
        try {
            setActionLoading(true)
            await canteenOwnerService.approveCanteenOwner(ownerId)
            alert(`Successfully approved ${ownerName}`)
            fetchPendingRegistrations()
        } catch (err) {
            alert('Failed to approve canteen owner')
            console.error(err)
        } finally {
            setActionLoading(false)
        }
    }

    const handleRejectClick = (owner) => {
        setSelectedOwner(owner)
        setRejectionReason('')
        setShowRejectModal(true)
    }

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason')
            return
        }
        try {
            setActionLoading(true)
            await canteenOwnerService.rejectCanteenOwner(selectedOwner.id, rejectionReason)
            alert(`Successfully rejected ${selectedOwner.ownerName}`)
            setShowRejectModal(false)
            setSelectedOwner(null)
            setRejectionReason('')
            fetchPendingRegistrations()
        } catch (err) {
            alert('Failed to reject canteen owner')
            console.error(err)
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    }

    return (
        <AdminLayout
            pendingCount={pendingOwners.length}
            pageTitle="Pending Approvals"
            pageSubtitle="Review and manage canteen owner registration requests"
        >
            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(249,115,22,0.2)', borderTop: '3px solid #f97316', animation: 'spin 0.8s linear infinite' }} />
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '20px', color: '#f87171' }}>
                    {error}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && pendingOwners.length === 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))',
                    border: '1px solid rgba(34,197,94,0.15)',
                    borderRadius: '20px',
                    padding: '64px 20px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>All Caught Up!</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>No pending canteen owner registrations at this time.</div>
                </div>
            )}

            {/* Table */}
            {!loading && !error && pendingOwners.length > 0 && (
                <>
                    {/* Count badge */}
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            background: 'rgba(234,179,8,0.12)',
                            border: '1px solid rgba(234,179,8,0.3)',
                            color: '#eab308',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '4px 12px',
                            borderRadius: '999px',
                        }}>
                            {pendingOwners.length} pending
                        </span>
                    </div>

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
                                        {['Owner', 'Email', 'Phone', 'Registered', 'Actions'].map(col => (
                                            <th key={col} style={{
                                                padding: '14px 20px',
                                                textAlign: col === 'Actions' ? 'center' : 'left',
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
                                    {pendingOwners.map((owner, i) => (
                                        <tr key={owner.id}
                                            style={{
                                                borderBottom: i < pendingOwners.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                        >
                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #eab308, #f97316)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '12px', color: 'white', fontWeight: 800, flexShrink: 0,
                                                    }}>
                                                        {owner.ownerName[0].toUpperCase()}
                                                    </div>
                                                    <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{owner.ownerName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{owner.email}</td>
                                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{owner.phoneNumber}</td>
                                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{formatDate(owner.createdAt)}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleApprove(owner.id, owner.ownerName)}
                                                        disabled={actionLoading}
                                                        style={{
                                                            padding: '7px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            opacity: actionLoading ? 0.5 : 1,
                                                            transition: 'opacity 0.15s, transform 0.15s',
                                                        }}
                                                        onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.transform = 'scale(1.03)' }}
                                                        onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(owner)}
                                                        disabled={actionLoading}
                                                        style={{
                                                            padding: '7px 16px',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(239,68,68,0.3)',
                                                            background: 'rgba(239,68,68,0.1)',
                                                            color: '#f87171',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            opacity: actionLoading ? 0.5 : 1,
                                                            transition: 'all 0.15s',
                                                        }}
                                                        onMouseEnter={e => { if (!actionLoading) { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'scale(1.03)' } }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'none' }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px',
                }}>
                    <div style={{
                        background: '#111',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '32px',
                        width: '100%',
                        maxWidth: '440px',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: '18px' }}>🚫</span>
                            </div>
                            <div>
                                <div style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>Reject Registration</div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                                    {selectedOwner?.ownerName}
                                </div>
                            </div>
                        </div>

                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Rejection Reason *
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            placeholder="Please provide a reason for rejection..."
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '13px',
                                resize: 'none',
                                outline: 'none',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                                marginBottom: '20px',
                            }}
                            onFocus={e => { e.target.style.border = '1px solid rgba(239,68,68,0.4)' }}
                            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)' }}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => { setShowRejectModal(false); setSelectedOwner(null); setRejectionReason('') }}
                                disabled={actionLoading}
                                style={{
                                    flex: 1, padding: '11px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px', color: 'rgba(255,255,255,0.6)',
                                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={actionLoading}
                                style={{
                                    flex: 1, padding: '11px',
                                    background: 'linear-gradient(135deg, #dc2626, #f97316)',
                                    border: 'none', borderRadius: '10px', color: 'white',
                                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                    opacity: actionLoading ? 0.6 : 1,
                                }}
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AdminLayout>
    )
}

export default PendingApprovals
