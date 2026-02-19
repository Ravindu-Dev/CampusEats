import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/* ─── Animated counter hook ─── */
function useCounter(target, duration = 2000, startCounting) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!startCounting) return
        let start = 0
        const step = target / (duration / 16)
        const timer = setInterval(() => {
            start += step
            if (start >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [startCounting, target, duration])
    return count
}

function Home() {
    const heroRef = useRef(null)
    const statsRef = useRef(null)
    const [statsVisible, setStatsVisible] = useState(false)

    /* ─── Parallax handler ─── */
    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                heroRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    /* ─── Stats observer ─── */
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) setStatsVisible(true)
        }, { threshold: 0.4 })
        if (statsRef.current) obs.observe(statsRef.current)
        return () => obs.disconnect()
    }, [])

    const students = useCounter(1200, 2000, statsVisible)
    const canteens = useCounter(10, 1500, statsVisible)
    const orders = useCounter(8500, 2500, statsVisible)

    return (
        <div className="min-h-screen font-sans bg-black text-white overflow-x-hidden">
            <Navbar isHome={true} />

            {/* ═══════════════════════════════════════
                SECTION 1 — CINEMATIC HERO
            ═══════════════════════════════════════ */}
            <section className="relative h-screen w-full overflow-hidden">
                <div
                    ref={heroRef}
                    className="absolute inset-0 w-full h-[130%] -top-[15%]"
                    style={{ willChange: 'transform' }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                        alt="Campus Food"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20 z-10" />

                <div className="relative z-20 h-full flex flex-col items-start justify-center max-w-7xl mx-auto px-6 lg:px-12 pt-20">
                    <div
                        className="mb-6 inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/40 backdrop-blur-md px-4 py-2 rounded-full"
                        style={{ animation: 'fadeInUp 0.6s ease forwards', animationDelay: '0.1s', opacity: 0 }}
                    >
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span className="text-orange-300 text-sm font-bold tracking-widest uppercase">Campus Dining Reimagined</span>
                    </div>

                    <h1
                        className="text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.9] tracking-tighter mb-5 uppercase"
                        style={{ animation: 'fadeInUp 0.7s ease forwards', animationDelay: '0.2s', opacity: 0 }}
                    >
                        <span className="block text-white drop-shadow-2xl">CAMPUS.</span>
                        <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">EATS.</span>
                    </h1>

                    {/* Tagline — outside h1 so it has its own clean, light style */}
                    <p
                        className="text-white/55 text-xl font-light italic tracking-wide mb-8"
                        style={{ animation: 'fadeInUp 0.7s ease forwards', animationDelay: '0.3s', opacity: 0 }}
                    >
                        Skip the queue. Savor every bite.
                    </p>

                    <p
                        className="text-gray-300 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light"
                        style={{ animation: 'fadeInUp 0.7s ease forwards', animationDelay: '0.4s', opacity: 0 }}
                    >
                        Order from all campus canteens in one place. Your food will be hot and ready when you arrive.
                    </p>

                    <div
                        className="flex flex-col sm:flex-row gap-4"
                        style={{ animation: 'fadeInUp 0.7s ease forwards', animationDelay: '0.5s', opacity: 0 }}
                    >
                        <Link
                            to="/menu"
                            className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-lg rounded-full shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:shadow-[0_0_60px_rgba(234,88,12,0.6)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            <span>Browse Menu</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        <Link
                            to="/signup"
                            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-lg rounded-full hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1 text-center"
                        >
                            Join Now
                        </Link>
                    </div>
                </div>

                <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
                    style={{ animation: 'fadeIn 1s ease forwards', animationDelay: '1.2s', opacity: 0 }}
                >
                    <span className="text-white/40 text-xs tracking-[0.3em] uppercase font-medium">Scroll</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
                </div>
            </section>

            {/* ═══════════════════════════════════════
                SECTION 2 — HOW IT WORKS (text-only)
            ═══════════════════════════════════════ */}
            <section className="relative bg-[#060606] py-32 overflow-hidden">
                {/* Faint grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '80px 80px',
                    }}
                />
                {/* Left edge glow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-orange-500/40 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
                    {/* Header */}
                    <div className="mb-20">
                        <span className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase">How it works</span>
                        <h2 className="mt-3 text-5xl md:text-6xl font-black text-white leading-tight">
                            Order smarter,<br />
                            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">eat faster.</span>
                        </h2>
                    </div>

                    {/* Steps — numbered large, bold, dark-card style */}
                    <div className="grid md:grid-cols-3 gap-px bg-white/[0.04] rounded-3xl overflow-hidden">
                        {[
                            {
                                num: '01',
                                title: 'Browse & Pick',
                                desc: 'Explore menus across every campus canteen in one place. Filter by cuisine, canteen, or price.',
                                icon: '🔍',
                            },
                            {
                                num: '02',
                                title: 'Order & Pay',
                                desc: 'Place your order instantly — choose to eat now or schedule for later. Pay securely via Stripe.',
                                icon: '💳',
                            },
                            {
                                num: '03',
                                title: 'Show QR & Collect',
                                desc: 'Watch your order status live. When it\'s ready, flash your QR code and walk away with your food.',
                                icon: '📲',
                            },
                        ].map((step, i) => (
                            <div
                                key={i}
                                className="group relative bg-[#0c0c0c] p-10 hover:bg-[#111] transition-colors duration-300"
                            >
                                {/* Step number — giant, faded */}
                                <span className="absolute top-6 right-8 text-[5rem] font-black leading-none text-white/[0.04] select-none group-hover:text-orange-500/10 transition-colors duration-500">
                                    {step.num}
                                </span>

                                <div className="text-4xl mb-6">{step.icon}</div>
                                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-orange-300 transition-colors duration-300">
                                    {step.title}
                                </h3>
                                <p className="text-gray-500 leading-relaxed">{step.desc}</p>

                                {/* Bottom accent line */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/0 to-transparent group-hover:via-orange-500/40 transition-all duration-500" />
                            </div>
                        ))}
                    </div>

                    {/* Marquee strip */}
                    <div className="mt-20 overflow-hidden border-y border-white/[0.06] py-5">
                        <div className="flex gap-12 animate-[marquee_18s_linear_infinite] whitespace-nowrap w-max">
                            {Array(8).fill(['Pre-Order', 'Skip the Queue', 'Live Tracking', 'QR Pickup', 'Secure Payments', 'All Canteens']).flat().map((t, i) => (
                                <span key={i} className="text-sm font-bold tracking-widest text-white/20 uppercase">{t} &nbsp;·</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
                SECTION 3 — STATS BANNER
            ═══════════════════════════════════════ */}
            <section ref={statsRef} className="relative py-16 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.15) 60px, rgba(255,255,255,0.15) 61px)' }}
                />
                <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
                    {[
                        { value: students, suffix: '+', label: 'Students Served' },
                        { value: canteens, suffix: '', label: 'Campus Canteens' },
                        { value: orders, suffix: '+', label: 'Orders Completed' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-black tabular-nums leading-none">
                                {stat.value.toLocaleString()}{stat.suffix}
                            </span>
                            <span className="text-white/70 text-sm md:text-base font-semibold mt-2 tracking-wider uppercase">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>


            {/* ═══════════════════════════════════════
                SECTION 5 — CTA
            ═══════════════════════════════════════ */}
            <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-black">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
                        alt="CTA bg"
                        className="w-full h-full object-cover opacity-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                </div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-orange-600/80 via-red-600/80 to-transparent" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24">
                    <div className="max-w-2xl">
                        <span className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase block mb-4">Ready to eat?</span>
                        <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 uppercase">
                            Hungry?<br />
                            <span className="text-orange-500">We Got You.</span>
                        </h2>
                        <p className="text-gray-400 text-xl mb-10 leading-relaxed">
                            Join thousands of students who've already upgraded their campus dining. Good food is just a tap away.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/signup"
                                className="px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-lg rounded-full shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:shadow-[0_0_70px_rgba(234,88,12,0.6)] hover:-translate-y-1 transition-all duration-300 text-center"
                            >
                                Get Started — It's Free
                            </Link>
                            <Link
                                to="/menu"
                                className="px-10 py-4 border border-white/20 text-white font-black text-lg rounded-full hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 text-center"
                            >
                                Browse Menu
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    )
}

export default Home
