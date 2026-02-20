import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'
import canteenAdminService from '../../services/canteenAdminService'
import AdminLayout from './AdminLayout'

function AllCanteens() {
    const [canteens, setCanteens] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCanteen, setSelectedCanteen] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const adminData = adminAuthService.getCurrentAdmin()
        if (!adminData) {
            navigate('/admin/login')
            return
        }
        fetchCanteens()
    }, [navigate])

    const fetchCanteens = async () => {
        try {
            setLoading(true)
            const data = await canteenAdminService.getAllCanteens()
            setCanteens(data)
            setError(null)
        } catch (err) {
            setError('Failed to fetch canteens')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filteredCanteens = canteens.filter(canteen =>
        canteen.canteenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        canteen.location.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const accentColors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#eab308']

    return (
        <AdminLayout pageTitle="Canteens" pageSubtitle="Manage and view all canteens on the platform">
            {/* Search + count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
                    <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            paddingLeft: '38px',
                            paddingRight: '16px',
                            paddingTop: '10px',
                            paddingBottom: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                        onFocus={e => { e.target.style.border = '1px solid rgba(249,115,22,0.5)' }}
                        onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginLeft: 'auto' }}>
                    {filteredCanteens.length} canteen{filteredCanteens.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(249,115,22,0.2)', borderTop: '3px solid #f97316', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : error ? (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '20px', color: '#f87171' }}>
                    {error}
                </div>
            ) : filteredCanteens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(255,255,255,0.25)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏪</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>No canteens found</div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                }}>
                    {filteredCanteens.map((canteen, i) => {
                        const accent = accentColors[i % accentColors.length]
                        return (
                            <div
                                key={canteen.id}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    cursor: 'default',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.border = `1px solid ${accent}40`
                                    e.currentTarget.style.transform = 'translateY(-3px)'
                                    e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.3)`
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
                                    e.currentTarget.style.transform = 'none'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                {/* Color bar */}
                                <div style={{ height: '3px', background: `linear-gradient(90deg, ${accent}, ${accent}80)` }} />

                                <div style={{ padding: '20px' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '12px',
                                            background: `${accent}1a`,
                                            border: `1px solid ${accent}30`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            flexShrink: 0,
                                        }}>
                                            🏪
                                        </div>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '999px',
                                            background: canteen.active ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                                            border: canteen.active ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
                                            color: canteen.active ? '#22c55e' : 'rgba(255,255,255,0.3)',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            letterSpacing: '0.5px',
                                        }}>
                                            {canteen.active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>

                                    <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
                                        {canteen.canteenName}
                                    </div>

                                    {/* Details */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px' }}>📍</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{canteen.location}, {canteen.campus}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px' }}>🕐</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{canteen.openingTime} – {canteen.closingTime}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px' }}>📞</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{canteen.phoneNumber}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => setSelectedCanteen(canteen)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: accent,
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                padding: 0,
                                            }}
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* ── Canteen Details Modal ── */}
            {selectedCanteen && (
                <div
                    onClick={() => setSelectedCanteen(null)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.72)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 200, padding: '20px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#111',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '480px',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header bar */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.10))',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                            padding: '20px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '12px',
                                    background: 'rgba(249,115,22,0.15)',
                                    border: '1px solid rgba(249,115,22,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '20px',
                                }}>
                                    🏪
                                </div>
                                <div>
                                    <div style={{ color: 'white', fontWeight: 800, fontSize: '17px' }}>
                                        {selectedCanteen.canteenName}
                                    </div>
                                    <span style={{
                                        padding: '2px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                                        background: selectedCanteen.active ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                                        border: selectedCanteen.active ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
                                        color: selectedCanteen.active ? '#22c55e' : 'rgba(255,255,255,0.35)',
                                    }}>
                                        {selectedCanteen.active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCanteen(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
                                    width: '32px', height: '32px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '16px', lineHeight: 1, flexShrink: 0,
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {[
                                    { icon: '📍', label: 'Location', value: `${selectedCanteen.location}, ${selectedCanteen.campus}` },
                                    { icon: '🕐', label: 'Hours', value: `${selectedCanteen.openingTime} – ${selectedCanteen.closingTime}` },
                                    { icon: '📞', label: 'Phone', value: selectedCanteen.phoneNumber },
                                    { icon: '✉️', label: 'Email', value: selectedCanteen.email || '—' },
                                    { icon: '🏫', label: 'Campus', value: selectedCanteen.campus || '—' },
                                    { icon: '📋', label: 'Description', value: selectedCanteen.description || '—' },
                                ].map(row => (
                                    <div key={row.label} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '14px',
                                        padding: '12px 14px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '10px',
                                    }}>
                                        <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{row.icon}</span>
                                        <div>
                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '3px' }}>
                                                {row.label}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.4 }}>
                                                {row.value}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedCanteen(null)}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    padding: '11px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    color: 'rgba(255,255,255,0.55)',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default AllCanteens
