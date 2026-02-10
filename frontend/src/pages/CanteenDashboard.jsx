import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import canteenService from '../services/canteenService'

function CanteenDashboard() {
    const [canteenOwner, setCanteenOwner] = useState(null)
    const [canteen, setCanteen] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) {
            navigate('/canteen/login')
            return
        }

        setCanteenOwner(owner)

        // Fetch canteen details
        if (owner.canteenId) {
            canteenService.getMyCanteen(owner.canteenId)
                .then(data => {
                    setCanteen(data)
                    setLoading(false)
                })
                .catch(err => {
                    console.error('Error fetching canteen:', err)
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [navigate])

    const handleLogout = () => {
        canteenAuthService.logout()
        navigate('/canteen/login')
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-300'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300'
            default: return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-orange-600">CampusEats</h1>
                            <p className="text-xs text-gray-600">Canteen Owner Portal</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">Welcome, {canteenOwner?.ownerName}!</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Status Banner */}
                {canteen && (
                    <div className={`mb-6 border rounded-lg p-4 ${getStatusColor(canteen.status)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">Registration Status: {canteen.status}</h3>
                                {canteen.status === 'PENDING' && (
                                    <p className="text-sm mt-1">Your canteen registration is under review. We'll notify you once approved.</p>
                                )}
                                {canteen.status === 'APPROVED' && (
                                    <p className="text-sm mt-1">Your canteen is live and ready to accept orders!</p>
                                )}
                                {canteen.status === 'REJECTED' && (
                                    <p className="text-sm mt-1">Your registration was not approved. Please contact support.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
                        <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-600 text-sm font-medium">Today's Revenue</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">₹0</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-600 text-sm font-medium">Avg Rating</h3>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">{canteen?.rating || 0} ⭐</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-600 text-sm font-medium">Active Menu Items</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
                    </div>
                </div>

                {/* Canteen Information */}
                {canteen && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-xl font-semibold mb-4">Canteen Information</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600">Canteen Name</p>
                                <p className="font-semibold text-lg">{canteen.canteenName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="font-semibold">{canteen.location} {canteen.campus && `(${canteen.campus})`}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Operating Hours</p>
                                <p className="font-semibold">{canteen.openingTime} - {canteen.closingTime}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Contact</p>
                                <p className="font-semibold">{canteen.phoneNumber}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-600">Description</p>
                                <p className="font-semibold">{canteen.description}</p>
                            </div>
                            {canteen.cuisineTypes && canteen.cuisineTypes.length > 0 && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600 mb-2">Cuisine Types</p>
                                    <div className="flex flex-wrap gap-2">
                                        {canteen.cuisineTypes.map(cuisine => (
                                            <span key={cuisine} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                                {cuisine}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Management Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Menu Management</h3>
                        <p className="text-gray-600 mb-4">Add, edit, or remove menu items</p>
                        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition">
                            Manage Menu
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Orders</h3>
                        <p className="text-gray-600 mb-4">View and manage incoming orders</p>
                        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition">
                            View Orders
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Reviews & Ratings</h3>
                        <p className="text-gray-600 mb-4">See customer feedback and ratings</p>
                        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition">
                            View Reviews
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Settings</h3>
                        <p className="text-gray-600 mb-4">Update canteen details and preferences</p>
                        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition">
                            Settings
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Reports</h3>
                        <p className="text-gray-600 mb-4">View sales and analytics reports</p>
                        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition">
                            View Reports
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Notifications</h3>
                        <p className="text-gray-600 mb-4">Manage notification preferences</p>
                        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition">
                            Notifications
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CanteenDashboard
