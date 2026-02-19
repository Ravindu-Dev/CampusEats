import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const VALUES = [
    {
        title: 'Student First',
        desc: 'Every feature we build is designed with the student lifestyle in mind. Fast, affordable, and mobile.',
        icon: '🎓',
        accent: 'from-blue-500 to-blue-700',
        border: 'border-blue-500/20',
        glow: 'bg-blue-500/10',
    },
    {
        title: 'Quality & Trust',
        desc: 'We partner only with verified canteens that meet strict hygiene and quality standards.',
        icon: '🤝',
        accent: 'from-green-500 to-green-700',
        border: 'border-green-500/20',
        glow: 'bg-green-500/10',
    },
    {
        title: 'Innovation',
        desc: 'Constantly pushing boundaries to make the dining experience smarter and more efficient.',
        icon: '🚀',
        accent: 'from-purple-500 to-purple-700',
        border: 'border-purple-500/20',
        glow: 'bg-purple-500/10',
    },
]

const STATS = [
    { value: '50+', label: 'Canteens', color: 'text-orange-400' },
    { value: '15k', label: 'Students', color: 'text-white' },
    { value: '1M+', label: 'Orders', color: 'text-blue-400' },
    { value: '4.9', label: 'Avg Rating', color: 'text-green-400' },
]

function About() {
    return (
        <div className="min-h-screen bg-[#080808] font-sans text-white">
            <Navbar />

            {/* ── Hero ── */}
            <div className="relative pt-20 pb-36 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop"
                        alt="About Us"
                        className="w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/40 via-[#080808]/60 to-[#080808]" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
                    <span className="inline-flex items-center gap-2 bg-orange-600/15 border border-orange-500/30 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span className="text-orange-300 text-xs font-bold tracking-widest uppercase">Our Story</span>
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
                        We Feed the <br />
                        <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 bg-clip-text text-transparent">Future.</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-3xl mx-auto font-light italic leading-relaxed">
                        CampusEats isn't just an app. It's a movement to fuel the minds of tomorrow with good food, zero hassle.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-24">

                {/* ── Mission ── */}
                <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                    <div className="order-2 md:order-1">
                        <span className="inline-flex items-center px-3 py-1 bg-orange-500/15 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            Our Mission
                        </span>
                        <h2 className="text-4xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
                            Revolutionizing <br /> Campus Dining
                        </h2>
                        <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                            We believe that students shouldn't have to choose between studying, socializing, and eating well. CampusEats connects you with the best food your campus has to offer, seamlessly.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed border-l-4 border-orange-500/60 pl-5 italic">
                            "Accessible, affordable, and convenient food for every student, every day."
                        </p>
                    </div>

                    <div className="order-1 md:order-2 relative">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
                        <img
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop"
                            alt="Student Group"
                            className="relative rounded-3xl shadow-2xl z-10 hover:scale-[1.02] transition-transform duration-500 border border-white/[0.07]"
                        />
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="bg-[#111] border border-white/[0.07] rounded-3xl p-12 mb-20 shadow-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/[0.05]">
                        {STATS.map((s) => (
                            <div key={s.label} className="p-4">
                                <div className={`text-4xl md:text-5xl font-black mb-2 ${s.color}`}>{s.value}</div>
                                <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Core Values ── */}
                <div className="mb-20">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-tight">Core Values</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">What drives us every single day.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {VALUES.map((v) => (
                            <div
                                key={v.title}
                                className={`group relative bg-[#111] border ${v.border} rounded-2xl p-8 overflow-hidden hover:border-opacity-60 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300`}
                            >
                                {/* Top accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${v.accent}`} />

                                <div className={`w-16 h-16 ${v.glow} border ${v.border} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {v.icon}
                                </div>
                                <h3 className="text-lg font-black text-white mb-3 group-hover:text-orange-300 transition-colors">{v.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Join Us CTA ── */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    <div className="relative z-10 p-12 md:p-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Build with Us</h2>
                        <p className="text-xl text-orange-50 mb-10 max-w-2xl mx-auto font-light">
                            Are you a passionate developer, designer, or foodie? Join the CampusEats team and shape the future of campus dining.
                        </p>
                        <a
                            href="/contact"
                            className="inline-block px-10 py-4 bg-white text-orange-600 rounded-full font-black shadow-xl shadow-black/20 hover:shadow-black/40 hover:-translate-y-1 hover:bg-gray-50 transition-all duration-300"
                        >
                            Join the Team →
                        </a>
                    </div>
                </div>

            </div>

            <Footer />
        </div>
    )
}

export default About
