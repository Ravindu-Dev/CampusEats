import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'

const navItems = [
    { path: '/canteen/dashboard', label: 'Dashboard', icon: '📊', color: 'blue' },
    { path: '/canteen/orders', label: 'Orders', icon: '📝', color: 'indigo' },
    { path: '/canteen/kitchen', label: 'Kitchen', icon: '🍳', color: 'red' },
    { path: '/canteen/menu-management', label: 'Menu', icon: '🍽️', color: 'orange' },
    { path: '/canteen/staff', label: 'Staff', icon: '👥', color: 'purple' },
    { path: '/canteen/attendance', label: 'Attendance', icon: '📅', color: 'cyan' },
    { path: '/canteen/payroll', label: 'Payroll', icon: '💰', color: 'emerald' },
    { path: '/canteen/reviews', label: 'Reviews', icon: '⭐', color: 'yellow' },
    { path: '/canteen/scan-qr', label: 'Scan QR', icon: '📷', color: 'green' },
]

export default function CanteenLayout({ children, pageTitle, pageSubtitle }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [canteenOwner, setCanteenOwner] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* Top Navigation */}
            <header style={{
                background: 'rgba(10,10,10,0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'sticky',
                top: 0,
                zIndex: 40,
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '80px', justifyContent: 'space-between' }}>

                        {/* Logo & Branding */}
                        <Link to="/canteen/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                            }}>
                                <span style={{ color: 'white', fontWeight: 900, fontSize: '20px' }}>C</span>
                            </div>
                            <div>
                                <div style={{ color: 'white', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    CampusEats
                                </div>
                                <div style={{ color: '#f97316', fontWeight: 700, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                    Canteen Portal
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav style={{ alignItems: 'center', gap: '8px' }} className="hidden md:flex">
                            {navItems.map((item) => {
                                const active = isActive(item.path)
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 16px',
                                            borderRadius: '12px',
                                            textDecoration: 'none',
                                            background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                                            color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                            fontWeight: active ? 700 : 500,
                                            fontSize: '14px',
                                            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                            position: 'relative',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.color = '#ffffff'
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                                                e.currentTarget.style.background = 'transparent'
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                        {item.label}
                                        {active && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-22px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '24px',
                                                height: '4px',
                                                borderRadius: '4px 4px 0 0',
                                                background: '#f97316',
                                                boxShadow: '0 -2px 8px rgba(249,115,22,0.4)',
                                            }} />
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Right Area (Profile & Settings) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Live Badge */}
                            <div className="hidden sm:flex" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600 }}>Online</span>
                            </div>

                            {/* Divider */}
                            <div className="hidden sm:block" style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />

                            {/* Owner Info & Logout */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="hidden sm:block" style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>
                                        {canteenOwner?.ownerName || 'Canteen Owner'}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 500 }}>
                                        Manage your portal
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(220,38,38,0.1)',
                                        border: '1px solid rgba(220,38,38,0.2)',
                                        color: '#f87171',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(220,38,38,0.2)'
                                        e.currentTarget.style.transform = 'translateY(-1px)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(220,38,38,0.1)'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }}
                                    title="Logout"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>

                                {/* Mobile Menu Toggle */}
                                <button
                                    className="md:hidden flex items-center justify-center p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {isMobileMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-800 bg-gray-900 absolute w-full left-0 top-full">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                                            ? 'bg-orange-500/10 text-orange-400'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </header>

            {/* Page Header (Optional) */}
            {(pageTitle || pageSubtitle) && (
                <div style={{ background: 'linear-gradient(to bottom, rgba(23,23,23,0.8) 0%, rgba(10,10,10,0) 100%)', padding: '32px 0 16px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
                        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                            {pageTitle}
                        </h1>
                        {pageSubtitle && (
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0 }}>
                                {pageSubtitle}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                {children}
            </main>
        </div>
    )
}
