import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'

function AdminDashboard() {
    const [admin, setAdmin] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const currentAdmin = adminAuthService.getCurrentAdmin()
        if (!currentAdmin) {
            navigate('/admin/login')
        } else {
            setAdmin(currentAdmin)
        }
    }, [navigate])

    const handleLogout = () => {
        adminAuthService.logout()
        navigate('/admin/login')
    }

    if (!admin) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">CampusEats Admin</h1>
                        <p className="text-sm text-gray-600">Welcome, {admin.name}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Dashboard Cards */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900">-</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Canteens</p>
                                <p className="text-3xl font-bold text-gray-900">-</p>
                            </div>
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                                <p className="text-3xl font-bold text-gray-900">-</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold">
                            Manage Users
                        </button>
                        <button className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition font-semibold">
                            Manage Canteens
                        </button>
                        <button className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                            Approve Canteens
                        </button>
                        <button className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                            View Reports
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent activity to display</p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard
