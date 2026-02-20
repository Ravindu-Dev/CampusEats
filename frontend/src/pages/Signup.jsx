import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const STEPS = ['Personal', 'Account', 'Contact']

function Signup() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', username: '', email: '',
        password: '', phoneNumber: '', address: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { signup } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    /* Trap Enter key so the browser never triggers an implicit form submit */
    const trapEnter = (e) => { if (e.key === 'Enter') { e.preventDefault(); nextStep() } }

    const nextStep = () => {
        setError('')
        if (step === 1) {
            if (!formData.firstName.trim() || !formData.lastName.trim()) {
                return setError('Please fill in your first and last name.')
            }
        }
        if (step === 2) {
            if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
                return setError('Please fill in all account fields.')
            }
            if (formData.password.length < 6) {
                return setError('Password must be at least 6 characters.')
            }
        }
        if (step < STEPS.length) {
            setStep(s => s + 1)
        }
    }

    const handleFinalSubmit = async () => {
        setError('')
        if (!formData.firstName || !formData.username || !formData.email || !formData.password) {
            return setError('Missing required fields. Please go back and fill them in.')
        }
        setLoading(true)
        try {
            await signup(formData)
            navigate('/login')
        } catch (err) {
            setError(err.response?.data || 'Signup failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const inputCls = "w-full px-4 py-3.5 bg-[#111] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
    const labelCls = "block text-sm font-bold text-gray-400 mb-2"

    return (
        <div className="min-h-screen bg-[#080808] font-sans flex">

            {/* ── Left Branding Panel ── */}
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#080808]/80 via-[#080808]/40 to-orange-900/20" />
                <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-orange-600/15 rounded-full blur-[100px]" />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-lg">C</span>
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">CampusEats</span>
                    </Link>

                    <div>
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                            Your campus.<br />
                            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                Your food.
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xs leading-relaxed">
                            Join thousands of students who order smarter, not harder.
                        </p>

                        {/* Feature list */}
                        <ul className="mt-8 space-y-3">
                            {['Real-time order tracking', 'Skip the lunch queue', 'Rate & review canteens'].map(f => (
                                <li key={f} className="flex items-center gap-3 text-gray-400 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
                <div className="w-full max-w-lg">

                    {/* Mobile logo */}
                    <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span className="text-white font-black">C</span>
                        </div>
                        <span className="text-white font-black text-lg">CampusEats</span>
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Create your account</h2>
                        <p className="text-gray-500 text-sm">
                            Step <span className="text-white font-bold">{step}</span> of <span className="text-white font-bold">{STEPS.length}</span> — <span className="text-orange-400 font-bold">{STEPS[step - 1]}</span>
                        </p>
                    </div>

                    {/* Step progress dots */}
                    <div className="flex items-center gap-2 mb-8">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300 ${i + 1 < step ? 'bg-orange-500 text-white' : i + 1 === step ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30' : 'bg-white/[0.06] text-gray-600'}`}>
                                    {i + 1 < step ? '✓' : i + 1}
                                </div>
                                <span className={`text-xs font-bold ${i + 1 === step ? 'text-white' : 'text-gray-600'}`}>{s}</span>
                                {i < STEPS.length - 1 && <div className={`h-px w-8 mx-1 transition-all ${i + 1 < step ? 'bg-orange-500' : 'bg-white/[0.06]'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* No <form> wrapper — all buttons are type=button to avoid any accidental browser form submission */}
                    <div className="space-y-5">

                        {/* Step 1: Personal */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>First Name *</label>
                                        <input
                                            type="text" name="firstName" value={formData.firstName}
                                            onChange={handleChange} onKeyDown={trapEnter}
                                            className={inputCls} placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Last Name *</label>
                                        <input
                                            type="text" name="lastName" value={formData.lastName}
                                            onChange={handleChange} onKeyDown={trapEnter}
                                            className={inputCls} placeholder="Doe"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Account */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div>
                                    <label className={labelCls}>Username *</label>
                                    <input
                                        type="text" name="username" value={formData.username}
                                        onChange={handleChange} onKeyDown={trapEnter}
                                        className={inputCls} placeholder="johndoe"
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Email *</label>
                                    <input
                                        type="email" name="email" value={formData.email}
                                        onChange={handleChange} onKeyDown={trapEnter}
                                        className={inputCls} placeholder="john@university.edu"
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'} name="password"
                                            value={formData.password} onChange={handleChange} onKeyDown={trapEnter}
                                            className={`${inputCls} pr-12`} placeholder="Min. 6 characters"
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
                            </div>
                        )}

                        {/* Step 3: Contact */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <div>
                                    <label className={labelCls}>Phone Number <span className="text-gray-600 font-normal">(optional)</span></label>
                                    <input
                                        type="tel" name="phoneNumber" value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={inputCls} placeholder="+94 77 000 0000"
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Campus Address <span className="text-gray-600 font-normal">(optional)</span></label>
                                    <input
                                        type="text" name="address" value={formData.address}
                                        onChange={handleChange}
                                        className={inputCls} placeholder="e.g., Block A, Room 201"
                                    />
                                </div>
                                <p className="text-xs text-gray-600">These fields are optional and can be updated anytime in your profile.</p>
                            </div>
                        )}

                        {/* Nav buttons — all type=button, no form element */}
                        <div className="flex gap-3 pt-2">
                            {step > 1 && (
                                <button type="button" onClick={() => { setError(''); setStep(s => s - 1) }}
                                    className="flex-1 py-3.5 bg-white/[0.06] border border-white/[0.08] text-white font-bold rounded-xl hover:bg-white/10 transition">
                                    ← Back
                                </button>
                            )}
                            {step < STEPS.length ? (
                                <button type="button" onClick={nextStep}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:-translate-y-0.5 transition-all">
                                    Continue →
                                </button>
                            ) : (
                                <button type="button" onClick={handleFinalSubmit} disabled={loading}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating account...
                                        </span>
                                    ) : 'Create Account 🎉'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-orange-400 font-bold hover:text-orange-300 transition">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup
