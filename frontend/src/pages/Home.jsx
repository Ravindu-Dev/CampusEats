import { Link } from 'react-router-dom'

function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-primary-600">CampusEats</h1>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Welcome to CampusEats
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Your campus food delivery and canteen pre-order solution.
                        Order from your favorite campus restaurants and skip the queue!
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/signup"
                            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-semibold"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition text-lg font-semibold"
                        >
                            Login
                        </Link>
                    </div>
                </div>

                <div className="mt-20 grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">🍔</div>
                        <h3 className="text-xl font-semibold mb-2">Browse Menus</h3>
                        <p className="text-gray-600">
                            Explore food options from all campus canteens and restaurants
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className="text-xl font-semibold mb-2">Pre-Order</h3>
                        <p className="text-gray-600">
                            Order ahead and skip the queue with QR code pickup
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">⭐</div>
                        <h3 className="text-xl font-semibold mb-2">Review & Rate</h3>
                        <p className="text-gray-600">
                            Share your experience and help others make better choices
                        </p>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-600 text-sm">
                            © 2026 CampusEats. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm">
                            <Link to="/canteen/login" className="text-orange-600 hover:text-orange-700 font-medium">
                                Canteen Owner Login
                            </Link>
                            <Link to="/admin/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Admin Portal
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home
