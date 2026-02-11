import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'
import canteenOwnerService from '../../services/canteenOwnerService'

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
        if (!confirm(`Are you sure you want to approve ${ownerName}?`)) {
            return
        }

        try {
            setActionLoading(true)
            await canteenOwnerService.approveCanteenOwner(ownerId)
            alert(`Successfully approved ${ownerName}`)
            fetchPendingRegistrations() // Refresh list
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
            fetchPendingRegistrations() // Refresh list
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
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center space-x-2">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-lg font-semibold text-gray-700">Back to Dashboard</span>
                        </button>
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-700 font-medium">Admin</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-8 text-white mb-8">
                    <h1 className="text-4xl font-bold mb-2">Pending Approvals</h1>
                    <p className="text-lg opacity-90">Review and manage canteen owner registration requests</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                        <p className="font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && pendingOwners.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
                        <p className="text-gray-600">No pending canteen owner registrations at this time.</p>
                    </div>
                )}

                {/* Pending Registrations Table */}
                {!loading && !error && pendingOwners.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Owner Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Registered</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pendingOwners.map((owner, index) => (
                                        <tr key={owner.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{owner.ownerName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-700">{owner.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-700">{owner.phoneNumber}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">{formatDate(owner.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                                    {owner.approvalStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleApprove(owner.id, owner.ownerName)}
                                                        disabled={actionLoading}
                                                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(owner)}
                                                        disabled={actionLoading}
                                                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                )}
            </main>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Registration</h2>
                        <p className="text-gray-600 mb-4">
                            You are about to reject <span className="font-semibold">{selectedOwner?.ownerName}</span>'s registration.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rejection Reason *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows="4"
                                placeholder="Please provide a reason for rejection..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setSelectedOwner(null)
                                    setRejectionReason('')
                                }}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-md disabled:opacity-50"
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PendingApprovals
