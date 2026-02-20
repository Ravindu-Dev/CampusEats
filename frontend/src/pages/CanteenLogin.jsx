import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'

function CanteenLogin() {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await canteenAuthService.login(formData)
            navigate('/canteen/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#080808] font-sans flex">

            {/* ── Left Branding Panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#080808] via-[#080808]/60 to-orange-900/25" />
                <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-orange-600/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-52 h-52 bg-yellow-600/8 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col justify-between p-14 w-full">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-lg">C</span>
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">CampusEats</span>
                        <span className="text-xs text-orange-400 font-bold bg-orange-500/15 border border-orange-500/25 px-2 py-0.5 rounded-full">Partner</span>
                    </Link>

                    <div>
                        <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 px-4 py-2 rounded-full mb-6">
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                            <span className="text-orange-300 text-xs font-bold uppercase tracking-widest">Partner Portal</span>
                        </div>
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                            Manage your<br />
                            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                canteen with ease.
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                            Access your dashboard to manage orders, menu, and real-time kitchen updates.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            {[
                                { icon: '📋', label: 'Order Management' },
                                { icon: '🍳', label: 'Kitchen Dashboard' },
                                { icon: '📊', label: 'Analytics' },
                                { icon: '⭐', label: 'Reviews' },
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
                        <span className="text-white font-black text-lg">CampusEats Partner</span>
                    </Link>

                    {/* Icon + Header */}
                    <div className="mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/25 flex items-center justify-center mb-5">
                            <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Partner Portal</h2>
                        <p className="text-gray-500">Login to manage your canteen.</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="w-full pl-10 pr-4 py-3.5 bg-[#111] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
                                    placeholder="owner@canteen.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                                    className="w-full pl-10 pr-12 py-3.5 bg-[#111] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-gray-400 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Logging in...
                                </span>
                            ) : 'Login to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-3 text-center">
                        <p className="text-gray-500 text-sm">New to CampusEats?</p>
                        <Link to="/canteen/register"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.06] border border-white/[0.08] text-white font-bold rounded-xl hover:bg-white/10 transition text-sm">
                            Register Your Canteen →
                        </Link>
                        <div className="pt-2">
                            <Link to="/login" className="text-xs text-gray-600 hover:text-gray-400 transition">
                                Student? Login here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CanteenLogin
