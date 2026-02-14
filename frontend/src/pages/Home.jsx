import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Home() {
    return (
        <div className="min-h-screen font-sans text-gray-900">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                        alt="Delicious Food"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight animate-fade-in-up">
                        <span className="block mb-2">Taste the</span>
                        <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">Excellence</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-100">
                        Experience the finest campus dining. Order from your favorite canteens, skip the line, and savor every bite.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-200">
                        <Link
                            to="/menu"
                            className="px-10 py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-lg font-bold shadow-[0_10px_20px_rgba(234,88,12,0.4)] transition-all transform hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(234,88,12,0.5)]"
                        >
                            Browse Menu
                        </Link>
                        <Link
                            to="/signup"
                            className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full text-lg font-bold hover:bg-white/20 transition-all transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            Join Now
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-orange-600 font-bold tracking-wide uppercase text-sm mb-3">Why CampusEats?</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            Dining Reimagined
                        </h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We've optimized every step of your food journey to give you more time for what matters.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Lightning Fast",
                                desc: "Skip the queue completely. Pre-order and pick up when your food is hot and ready.",
                                icon: (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                ),
                                color: "from-orange-500 to-red-500"
                            },
                            {
                                title: "Diverse Selection",
                                desc: "From healthy salads to cheat-day burgers, explore menus from all campus canteens.",
                                icon: (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                ),
                                color: "from-blue-500 to-indigo-500"
                            },
                            {
                                title: "Secure Payments",
                                desc: "Complete peace of mind with our encrypted, cashless payment system.",
                                icon: (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                ),
                                color: "from-green-500 to-emerald-500"
                            }
                        ].map((feature, index) => (
                            <div key={index} className="group relative p-1 rounded-3xl bg-gradient-to-br from-gray-100 via-white to-gray-100 hover:from-orange-500 hover:to-red-600 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative h-full bg-white/80 backdrop-blur-xl p-10 rounded-[22px] overflow-hidden border border-white/50 group-hover:border-transparent transition-all duration-300">
                                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-5 rounded-bl-full transition-all duration-500 group-hover:scale-150 group-hover:opacity-10`}></div>

                                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                        {feature.icon}
                                    </div>

                                    <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                        {feature.title}
                                    </h4>

                                    <p className="text-gray-600 leading-relaxed font-medium group-hover:text-gray-800 transition-colors duration-300">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop" alt="Background" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Hungry? <br />
                            <span className="text-orange-500">We've got you covered.</span>
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-lg">
                            Join thousands of students who have already upgraded their campus dining experience. Good food is just a tap away.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                to="/signup"
                                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-orange-900/20"
                            >
                                Get Started
                            </Link>
                            <Link
                                to="/contact"
                                className="px-8 py-4 bg-transparent border border-white/20 text-white hover:bg-white/10 rounded-xl font-bold transition-all backdrop-blur-sm"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default Home
