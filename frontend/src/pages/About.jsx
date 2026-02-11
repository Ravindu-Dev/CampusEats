import Navbar from '../components/Navbar'

function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        About CampusEats
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Connecting students with delicious campus dining options, one meal at a time
                    </p>
                </div>

                {/* Mission Section */}
                <div className="bg-white rounded-2xl shadow-xl p-12 mb-12">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-lg text-gray-600 mb-4">
                                CampusEats is dedicated to revolutionizing the campus dining experience by providing a seamless platform that connects students with their favorite canteens.
                            </p>
                            <p className="text-lg text-gray-600">
                                We believe that great food should be accessible, affordable, and convenient for every student on campus.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-xl p-8 text-center">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h3>
                            <p className="text-gray-700">
                                To become the #1 food ordering platform for campus communities nationwide
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        Why Choose CampusEats?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Easy</h3>
                            <p className="text-gray-600">
                                Order your favorite meals in just a few taps. Quick, simple, and hassle-free.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Student Friendly</h3>
                            <p className="text-gray-600">
                                Affordable pricing designed specifically for student budgets and needs.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Trusted & Secure</h3>
                            <p className="text-gray-600">
                                Safe payments and verified canteen partners you can trust.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-xl p-12 text-white mb-12">
                    <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold mb-2">500+</div>
                            <div className="text-lg opacity-90">Happy Students</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">20+</div>
                            <div className="text-lg opacity-90">Campus Canteens</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">1000+</div>
                            <div className="text-lg opacity-90">Orders Delivered</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">4.8★</div>
                            <div className="text-lg opacity-90">Average Rating</div>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="bg-white rounded-2xl shadow-xl p-12">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
                        Built by Students, for Students
                    </h2>
                    <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-8">
                        CampusEats was created by a team of passionate students who understood the challenges of campus dining. We're committed to making your food experience better every day.
                    </p>
                    <div className="flex justify-center">
                        <a href="/contact" className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-md text-lg">
                            Get in Touch
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About
