import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'

const navItems = [
    {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        path: '/admin/canteen-owners',
        label: 'Canteen Owners',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        path: '/admin/canteens',
        label: 'Canteens',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        path: '/admin/pending-approvals',
        label: 'Approvals',
        badge: true,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        path: '/admin/payroll',
        label: 'Payroll',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
]

export default function AdminLayout({ children, pendingCount = 0, pageTitle, pageSubtitle }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const admin = adminAuthService.getCurrentAdmin()

    const handleLogout = () => {
        adminAuthService.logout()
        navigate('/admin/login')
    }

    const isActive = (path) => location.pathname === path

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* ── Sidebar ── */}
            <aside style={{
                width: sidebarCollapsed ? '72px' : '240px',
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #111111 0%, #0d0d0d 100%)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                position: 'sticky',
                top: 0,
                flexShrink: 0,
                zIndex: 40,
            }}>

                {/* Logo */}
                <div style={{
                    padding: sidebarCollapsed ? '20px 16px' : '20px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #f97316, #dc2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(249,115,22,0.35)',
                    }}>
                        <span style={{ color: 'white', fontWeight: 900, fontSize: '16px' }}>C</span>
                    </div>
                    {!sidebarCollapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ color: 'white', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>CampusEats</div>
                            <div style={{ color: '#f97316', fontWeight: 700, fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Admin Panel</div>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '6px' }}>
                        {!sidebarCollapsed && (
                            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px 10px 6px' }}>
                                Navigation
                            </div>
                        )}
                        {navItems.map((item) => {
                            const active = isActive(item.path)
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    title={sidebarCollapsed ? item.label : undefined}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: sidebarCollapsed ? '11px 16px' : '11px 12px',
                                        borderRadius: '10px',
                                        marginBottom: '3px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: active
                                            ? 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(220,38,38,0.12))'
                                            : 'transparent',
                                        boxShadow: active ? 'inset 0 0 0 1px rgba(249,115,22,0.25)' : 'none',
                                        transition: 'all 0.18s',
                                        textAlign: 'left',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) e.currentTarget.style.background = 'transparent'
                                    }}
                                >
                                    <span style={{ color: active ? '#f97316' : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>
                                        {item.icon}
                                    </span>
                                    {!sidebarCollapsed && (
                                        <span style={{
                                            color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                            fontSize: '14px',
                                            fontWeight: active ? 700 : 500,
                                            flex: 1,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {item.label}
                                        </span>
                                    )}
                                    {/* pending badge */}
                                    {item.badge && pendingCount > 0 && (
                                        <span style={{
                                            background: 'linear-gradient(135deg, #f97316, #dc2626)',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            borderRadius: '999px',
                                            padding: sidebarCollapsed ? '1px 5px' : '1px 7px',
                                            position: sidebarCollapsed ? 'absolute' : 'static',
                                            top: sidebarCollapsed ? '6px' : undefined,
                                            right: sidebarCollapsed ? '6px' : undefined,
                                            minWidth: '18px',
                                            textAlign: 'center',
                                        }}>
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* Admin Info + Logout */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 10px' }}>
                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        title={sidebarCollapsed ? 'Logout' : undefined}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: sidebarCollapsed ? '10px 16px' : '10px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            background: 'rgba(220,38,38,0.08)',
                            transition: 'all 0.18s',
                            marginBottom: '10px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.18)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)' }}
                    >
                        <svg style={{ color: '#f87171', flexShrink: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!sidebarCollapsed && (
                            <span style={{ color: '#f87171', fontSize: '14px', fontWeight: 600 }}>Logout</span>
                        )}
                    </button>

                    {/* Admin Avatar */}
                    {!sidebarCollapsed && admin && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.04)',
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f97316, #dc2626)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <span style={{ color: 'white', fontWeight: 800, fontSize: '13px' }}>
                                    {(admin.email || 'A')[0].toUpperCase()}
                                </span>
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {admin.email || 'Admin'}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Administrator</div>
                            </div>
                        </div>
                    )}

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setSidebarCollapsed(c => !c)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
                            padding: '8px 12px',
                            marginTop: '8px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.2)',
                            gap: '6px',
                            borderRadius: '8px',
                            transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)' }}
                    >
                        <svg style={{ width: '16px', height: '16px', transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        {!sidebarCollapsed && <span style={{ fontSize: '11px', fontWeight: 600 }}>Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

                {/* Top Bar */}
                <header style={{
                    background: 'rgba(10,10,10,0.95)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '0 28px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                }}>
                    <div>
                        <h1 style={{ color: 'white', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.3px', margin: 0, lineHeight: 1.2 }}>
                            {pageTitle}
                        </h1>
                        {pageSubtitle && (
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
                                {pageSubtitle}
                            </p>
                        )}
                    </div>

                    {/* Right side: live time badge */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600 }}>System Online</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}
