import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'

function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            setError('')
            setLoading(true)
            await adminAuthService.login({ email, password })
            navigate('/admin/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Access denied.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#080808] font-sans flex">

            {/* ── Left Branding Panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#080808]/80 via-[#080808]/40 to-orange-900/20" />
                {/* Ambient orbs */}
                <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-orange-600/12 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-red-700/8 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col justify-between p-14 w-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-lg">C</span>
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">CampusEats</span>
                        <span className="text-xs text-red-400 font-bold bg-red-500/15 border border-red-500/25 px-2 py-0.5 rounded-full ml-1">Admin</span>
                    </Link>

                    {/* Headline */}
                    <div>
                        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full mb-6">
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                            <span className="text-red-300 text-xs font-black uppercase tracking-widest">Restricted Access</span>
                        </div>

                        <h1 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                            Platform<br />
                            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                Control Centre.
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                            Manage users, canteens, orders, and the entire CampusEats ecosystem from one place.
                        </p>

                        {/* Admin capabilities */}
                        <div className="grid grid-cols-2 gap-3 mt-10">
                            {[
                                { icon: '👥', label: 'User Management' },
                                { icon: '🏪', label: 'Canteen Approvals' },
                                { icon: '📦', label: 'Order Oversight' },
                                { icon: '📊', label: 'Analytics' },
                            ].map(f => (
                                <div key={f.label} className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
                                    <span className="text-lg">{f.icon}</span>
                                    <span className="text-gray-400 text-xs font-semibold">{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span className="text-white font-black">C</span>
                        </div>
                        <span className="text-white font-black text-lg">CampusEats Admin</span>
                    </Link>

                    {/* Icon + Header */}
                    <div className="mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/25 flex items-center justify-center mb-5">
                            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Admin Portal</h2>
                        <p className="text-gray-500">Authorised personnel only.</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 bg-[#111] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
                                    placeholder="admin@campuseats.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3.5 bg-[#111] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-gray-400 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword
                                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : 'Access Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                        <Link to="/" className="text-xs text-gray-600 hover:text-gray-400 transition">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
