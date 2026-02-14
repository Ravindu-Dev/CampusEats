import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function About() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-black py-24 sm:py-32 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop"
                        alt="About Us"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 animate-fade-in-up">
                        We Feed the <br />
                        <span className="text-orange-500">Future.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-100">
                        CampusEats isn't just an app. It's a movement to fuel the minds of tomorrow with good food, zero hassle.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Mission Section */}
                <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                    <div className="order-2 md:order-1 animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wide">Our Mission</span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">
                            Revolutionizing <br /> Campus Dining
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            We believe that students shouldn't have to choose between studying, socializing, and eating well. CampusEats connects you with the best food your campus has to offer, seamlessly.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-orange-500 pl-4 italic">
                            "Accessible, affordable, and convenient food for every student, every day."
                        </p>
                    </div>
                    <div className="order-1 md:order-2 relative animate-fade-in-up delay-100">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-yellow-400 rounded-full opacity-20 filter blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-64 h-64 bg-orange-500 rounded-full opacity-20 filter blur-3xl"></div>
                        <img
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop"
                            alt="Student Group"
                            className="relative rounded-3xl shadow-2xl z-10 hover:scale-[1.02] transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-gray-900 rounded-3xl shadow-2xl p-12 text-white mb-20 animate-fade-in-up">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">50+</div>
                            <div className="text-sm md:text-base text-gray-400 font-medium uppercase tracking-wider">Canteens</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-black text-white mb-2">15k</div>
                            <div className="text-sm md:text-base text-gray-400 font-medium uppercase tracking-wider">Students</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-black text-indigo-400 mb-2">1M+</div>
                            <div className="text-sm md:text-base text-gray-400 font-medium uppercase tracking-wider">Orders</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-black text-green-400 mb-2">4.9</div>
                            <div className="text-sm md:text-base text-gray-400 font-medium uppercase tracking-wider">Rating</div>
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Values</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">What drives us every single day.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Student First",
                                desc: "Every feature we build is designed with the student lifestyle in mind. Fast, cheap, and mobile.",
                                icon: "🎓",
                                color: "from-blue-400 to-blue-600"
                            },
                            {
                                title: "Quality & Trust",
                                desc: "We partner only with verified canteens that meet strict hygiene and quality standards.",
                                icon: "🤝",
                                color: "from-green-400 to-green-600"
                            },
                            {
                                title: "Innovation",
                                desc: "Constantly pushing boundaries to make the dining experience smarter and more efficient.",
                                icon: "🚀",
                                color: "from-purple-400 to-purple-600"
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="group relative p-1 rounded-3xl bg-gradient-to-br from-gray-100 via-white to-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                <div className="h-full bg-white p-8 rounded-[22px] flex flex-col items-center text-center relative overflow-hidden">
                                    <div className={`absolute top-0 w-full h-1 bg-gradient-to-r ${value.color}`}></div>
                                    <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-full flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 text-white`}>
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">{value.title}</h3>
                                    <p className="text-gray-600 leading-relaxed font-medium">
                                        {value.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team / Join Us Teaser */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                    <div className="relative z-10 p-12 md:p-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-md">
                            Build with Us
                        </h2>
                        <p className="text-xl text-orange-50 mb-10 max-w-2xl mx-auto font-medium">
                            Are you a passionate developer, designer, or foodie? Join the CampusEats team and shape the future of campus dining.
                        </p>
                        <a
                            href="/contact"
                            className="inline-block px-10 py-4 bg-white text-orange-600 rounded-full font-black shadow-lg shadow-black/20 hover:shadow-black/30 transform hover:-translate-y-1 hover:bg-gray-50 transition-all duration-300"
                        >
                            Join the Team
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default About
