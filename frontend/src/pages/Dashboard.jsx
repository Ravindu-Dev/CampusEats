import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-primary-600">CampusEats</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">Welcome, {user?.username}!</span>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Food Booking</h3>
                        <p className="text-gray-600 mb-4">Browse and order from campus canteens</p>
                        <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition">
                            Browse Menu
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">My Orders</h3>
                        <p className="text-gray-600 mb-4">View your order history and status</p>
                        <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition">
                            View Orders
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Reviews</h3>
                        <p className="text-gray-600 mb-4">Rate and review your orders</p>
                        <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition">
                            My Reviews
                        </button>
                    </div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary-600">0</p>
                            <p className="text-gray-600">Total Orders</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary-600">0</p>
                            <p className="text-gray-600">Reviews Written</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary-600">0</p>
                            <p className="text-gray-600">Favorite Items</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
