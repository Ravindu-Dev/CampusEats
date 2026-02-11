import Navbar from '../components/Navbar'

function Reviews() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-6">
                        <div className="text-8xl mb-4">⭐</div>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Reviews & Ratings
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        See what students are saying about campus canteens
                    </p>
                </div>

                {/* Coming Soon Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Coming Soon!
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                We're building a comprehensive review system where you can share your dining experiences and help fellow students make informed choices!
                            </p>
                        </div>

                        {/* Sample Review Cards (Mockup) */}
                        <div className="space-y-4 mb-8">
                            <div className="bg-gray-50 rounded-xl p-6 text-left opacity-60">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Student Name</div>
                                        <div className="flex text-yellow-400 text-sm">
                                            ★★★★★
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    "Amazing food quality and quick service! The biryani is a must-try..."
                                </p>
                                <div className="mt-2 text-xs text-gray-500">Canteen Name • 2 days ago</div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 text-left opacity-60">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Student Name</div>
                                        <div className="flex text-yellow-400 text-sm">
                                            ★★★★☆
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    "Great variety of options. Loved the healthy meal choices available..."
                                </p>
                                <div className="mt-2 text-xs text-gray-500">Canteen Name • 5 days ago</div>
                            </div>
                        </div>

                        {/* Feature Preview */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <div className="text-4xl mb-3">✍️</div>
                                <h3 className="font-semibold text-gray-900 mb-2">Write Reviews</h3>
                                <p className="text-sm text-gray-600">Share your experience</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <div className="text-4xl mb-3">📊</div>
                                <h3 className="font-semibold text-gray-900 mb-2">Detailed Ratings</h3>
                                <p className="text-sm text-gray-600">Rate food, service, and value</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <div className="text-4xl mb-3">🏆</div>
                                <h3 className="font-semibold text-gray-900 mb-2">Top Rated</h3>
                                <p className="text-sm text-gray-600">Discover the best options</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                            <p className="text-sm text-gray-700 mb-4">
                                <strong>Coming soon!</strong> We're working on this feature to help you make the best dining decisions.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <a href="/" className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-md">
                                    Back to Home
                                </a>
                                <a href="/menu" className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold">
                                    View Menu
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reviews
