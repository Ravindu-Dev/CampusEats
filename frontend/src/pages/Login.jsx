import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { login } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(formData)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#080808] font-sans flex">

            {/* ── Left Panel — branding ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#080808]/80 via-[#080808]/40 to-orange-900/20" />
                {/* Ambient orbs */}
                <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-orange-600/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col justify-between p-14 w-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-lg">C</span>
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">CampusEats</span>
                    </Link>

                    {/* Headline */}
                    <div>
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                            Good food,<br />
                            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                zero wait.
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                            Order from your campus canteens, track in real-time, and pick up when it's ready.
                        </p>

                        {/* Social proof */}
                        <div className="flex items-center gap-4 mt-8">
                            <div className="flex -space-x-2">
                                {['RS', 'MK', 'AJ', 'LP'].map((i) => (
                                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 border-2 border-[#080808] flex items-center justify-center text-white text-xs font-bold">{i}</div>
                                ))}
                            </div>
                            <span className="text-gray-400 text-sm">Joined by <strong className="text-white">15,000+</strong> students</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Panel — form ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span className="text-white font-black">C</span>
                        </div>
                        <span className="text-white font-black text-lg">CampusEats</span>
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome back</h2>
                        <p className="text-gray-500">Sign in to your account to continue.</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text" name="username" value={formData.username} onChange={handleChange} required
                                    className="w-full pl-10 pr-4 py-3.5 bg-[#111] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
                                    placeholder="Enter your username"
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
                                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                                    className="w-full pl-10 pr-12 py-3.5 bg-[#111] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-gray-400 transition">
                                    {showPassword
                                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-3 text-center">
                        <p className="text-gray-500 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-orange-400 font-bold hover:text-orange-300 transition">Sign up free</Link>
                        </p>
                        <Link to="/canteen/login" className="block text-xs text-gray-600 hover:text-gray-400 transition">
                            Are you a canteen owner? → Login here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
