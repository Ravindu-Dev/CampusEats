import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'

const navSections = [
    {
        label: 'Main',
        items: [
            { path: '/canteen/dashboard', label: 'Dashboard', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" /></svg>
            )},
            { path: '/canteen/orders', label: 'Orders', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            )},
            { path: '/canteen/kitchen', label: 'Kitchen', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
            )},
        ],
    },
    {
        label: 'Management',
        items: [
            { path: '/canteen/menu-management', label: 'Menu', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            )},
            { path: '/canteen/combo-management', label: 'Combos', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            )},
            { path: '/canteen/scan-qr', label: 'Scan QR', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            )},
        ],
    },
    {
        label: 'Team',
        items: [
            { path: '/canteen/staff', label: 'Staff', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            )},
            { path: '/canteen/attendance', label: 'Attendance', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )},
            { path: '/canteen/payroll', label: 'Payroll', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )},
        ],
    },
    {
        label: 'Insights',
        items: [
            { path: '/canteen/reviews', label: 'Reviews', icon: (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            )},
        ],
    },
]

export default function CanteenLayout({ children, pageTitle, pageSubtitle }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [canteenOwner, setCanteenOwner] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) {
            navigate('/canteen/login')
            return
        }
        setCanteenOwner(owner)
    }, [navigate])

    const handleLogout = () => {
        canteenAuthService.logout()
        navigate('/canteen/login')
    }

    const isActive = (path) => location.pathname === path

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* ───── Sidebar ───── */}
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-screen z-50 w-[260px]
                bg-[#0e0e0e] border-r border-white/[0.06]
                flex flex-col
                transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo & Branding */}
                <div className="px-5 pt-6 pb-5 border-b border-white/[0.05]">
                    <Link to="/canteen/dashboard" className="flex items-center gap-3 no-underline" onClick={() => setSidebarOpen(false)}>
                        <div>
                            <div className="text-white font-extrabold text-[15px] tracking-tight leading-tight">CampusEats<span className="text-orange-500">.</span></div>
                            <div className="text-orange-500 font-bold text-[10px] tracking-[1.5px] uppercase">Canteen Portal</div>
                        </div>
                    </Link>
                </div>

                {/* Navigation Sections */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[2px] px-3 mb-2">{section.label}</p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const active = isActive(item.path)
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium no-underline transition-all duration-200
                                                ${active
                                                    ? 'bg-orange-500/12 text-orange-400 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.15)]'
                                                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
                                                }
                                            `}
                                        >
                                            <span className={`flex-shrink-0 transition-colors ${active ? 'text-orange-400' : 'text-white/25'}`}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                            {active && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer — Owner Info & Logout */}
                <div className="border-t border-white/[0.05] px-4 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-orange-500/20">
                            {canteenOwner?.ownerName?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-bold truncate">{canteenOwner?.ownerName || 'Canteen Owner'}</p>
                            <p className="text-white/30 text-[10px] font-medium truncate">{canteenOwner?.email || 'Manage portal'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400/70 bg-red-500/[0.06] border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ───── Main Area ───── */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">

                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.04]">
                    <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8">
                        {/* Mobile menu toggle */}
                        <button
                            className="lg:hidden mr-3 w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.07] transition-all cursor-pointer"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {sidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Page title in top bar */}
                        <div className="flex-1 min-w-0">
                            {pageTitle && (
                                <h1 className="text-white text-lg font-bold truncate tracking-tight">{pageTitle}</h1>
                            )}
                            {pageSubtitle && (
                                <p className="text-white/30 text-xs truncate hidden sm:block">{pageSubtitle}</p>
                            )}
                        </div>

                        {/* Right side badges */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                                <span className="text-white/40 text-[11px] font-semibold">Online</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
