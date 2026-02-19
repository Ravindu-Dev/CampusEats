import { Link } from 'react-router-dom'

function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="relative bg-[#080808] overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

            {/* Subtle grid backdrop */}
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                }}
            />

            {/* Ambient glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-10">

                {/* ── Main grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-12 gap-10 mb-16">

                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-5 flex flex-col gap-6">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                                C
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight group-hover:text-orange-400 transition-colors">
                                CampusEats
                            </span>
                        </Link>

                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Redefining the way students eat on campus. Fast ordering, live tracking, and cashless payments — all in one place.
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-3 mt-1">
                            {[
                                {
                                    label: 'Instagram',
                                    href: '#',
                                    icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'Twitter',
                                    href: '#',
                                    icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'LinkedIn',
                                    href: '#',
                                    icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    ),
                                },
                            ].map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all duration-300"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div className="col-span-1 md:col-span-2 md:col-start-7">
                        <h4 className="text-white font-bold text-xs tracking-[0.2em] uppercase mb-6">Explore</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Our Menu', to: '/menu' },
                                { label: 'Reviews', to: '/reviews' },
                                { label: 'About Us', to: '/about' },
                                { label: 'Contact', to: '/contact' },
                            ].map((l) => (
                                <li key={l.to}>
                                    <Link
                                        to={l.to}
                                        className="text-gray-500 text-sm hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-0 group-hover:w-3 h-px bg-orange-500 transition-all duration-300 overflow-hidden" />
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Partners */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-white font-bold text-xs tracking-[0.2em] uppercase mb-6">Partners</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Register Canteen', to: '/canteen/register' },
                                { label: 'Partner Login', to: '/canteen/login' },
                                { label: 'Admin Portal', to: '/admin/login' },
                            ].map((l) => (
                                <li key={l.to}>
                                    <Link
                                        to={l.to}
                                        className="text-gray-500 text-sm hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-0 group-hover:w-3 h-px bg-orange-500 transition-all duration-300 overflow-hidden" />
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="col-span-1 md:col-span-1">
                        <h4 className="text-white font-bold text-xs tracking-[0.2em] uppercase mb-6">Legal</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Privacy', to: '/privacy' },
                                { label: 'Terms', to: '/terms' },
                            ].map((l) => (
                                <li key={l.label}>
                                    <Link
                                        to={l.to}
                                        className="text-gray-500 text-sm hover:text-orange-400 transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-0 group-hover:w-3 h-px bg-orange-500 transition-all duration-300 overflow-hidden" />
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Bottom bar ── */}
                <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-xs">
                        © {year} <span className="text-gray-400 font-semibold">CampusEats</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <span>Made with</span>
                        <span className="text-red-500">♥</span>
                        <span>for campus students</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
