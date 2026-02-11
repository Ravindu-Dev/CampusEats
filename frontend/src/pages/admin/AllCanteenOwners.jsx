import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'
import canteenOwnerService from '../../services/canteenOwnerService'

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

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'REJECTED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center space-x-2">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-lg font-semibold text-gray-700">Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white mb-8">
                    <h1 className="text-4xl font-bold mb-2">Canteen Owners</h1>
                    <p className="text-lg opacity-90">View all registered canteen owners in the system</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="text-gray-600 font-medium">
                            Total: {filteredOwners.length} owners
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredOwners.map((owner) => (
                                        <tr key={owner.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{owner.ownerName}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{owner.email}</td>
                                            <td className="px-6 py-4 text-gray-700">{owner.phoneNumber}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(owner.approvalStatus)}`}>
                                                    {owner.approvalStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(owner.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default AllCanteenOwners
