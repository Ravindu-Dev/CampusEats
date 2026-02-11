import Navbar from '../components/Navbar'

function Menu() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-6">
                        <div className="text-8xl mb-4">🍕</div>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Food Menu
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover delicious meals from campus canteens
                    </p>
                </div>

                {/* Coming Soon Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mb-6">
                                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Coming Soon!
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                We're working hard to bring you an amazing food menu experience. Browse through various canteen menus, filter by cuisine type, dietary preferences, and more!
                            </p>
                        </div>

                        {/* Feature Preview */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <div className="text-4xl mb-3">🔍</div>
                                <h3 className="font-semibold text-gray-900 mb-2">Search & Filter</h3>
                                <p className="text-sm text-gray-600">Find exactly what you're craving</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <div className="text-4xl mb-3">⭐</div>
                                <h3 className="font-semibold text-gray-900 mb-2">Ratings & Reviews</h3>
                                <p className="text-sm text-gray-600">See what others are saying</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <div className="text-4xl mb-3">💰</div>
                                <h3 className="font-semibold text-gray-900 mb-2">Best Prices</h3>
                                <p className="text-sm text-gray-600">Student-friendly pricing</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                            <p className="text-sm text-gray-700 mb-4">
                                <strong>Stay tuned!</strong> This feature is currently under development and will be available soon.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <a href="/" className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-md">
                                    Back to Home
                                </a>
                                <a href="/contact" className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold">
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Menu
