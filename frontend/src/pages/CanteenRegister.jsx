import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import { imgbbService } from '../services/imgbbService'

const STEP_META = [
    { label: 'Account', icon: '👤' },
    { label: 'Canteen', icon: '🏪' },
    { label: 'Operations', icon: '⚙️' },
    { label: 'Review', icon: '✅' },
]

function CanteenRegister() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        ownerName: '', email: '', password: '', confirmPassword: '',
        phoneNumber: '', alternativeContactNumber: '',
        canteenName: '', logoUrl: '', campus: '', location: '',
        floorNumber: '', roomNumber: '', landmark: '', description: '',
        openingTime: '08:00', closingTime: '18:00',
        operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        averagePreparationTime: 15, deliveryAvailable: false, pickupAvailable: true,
        seatingCapacity: '', cuisineTypes: [], specialtyItems: '', dietaryOptions: [],
        businessRegistrationNumber: '', gstNumber: '', foodSafeLicenseNumber: '',
        bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', upiId: '',
        acceptedPaymentMethods: ['CASH', 'CARD', 'UPI'],
        websiteUrl: '', instagramHandle: '', facebookPage: '',
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
    }

    const handleCheckboxArray = (name, value) => {
        const cur = formData[name] || []
        setFormData({ ...formData, [name]: cur.includes(value) ? cur.filter(i => i !== value) : [...cur, value] })
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploading(true)
        setError('')
        try {
            const url = await imgbbService.uploadImage(file)
            setFormData(prev => ({ ...prev, logoUrl: url }))
        } catch {
            setError('Failed to upload logo. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const validate = () => {
        if (step === 1) {
            if (!formData.ownerName || !formData.email || !formData.password || !formData.phoneNumber) return setError('Please fill in all required fields.') || false
            if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.') || false
            if (formData.password.length < 6) return setError('Password must be at least 6 characters.') || false
        }
        if (step === 2) {
            if (!formData.canteenName || !formData.location || !formData.description) return setError('Please fill in Canteen Name, Location, and Description.') || false
            if (!formData.logoUrl) return setError('Please upload a canteen logo.') || false
        }
        if (step === 3) {
            if (!formData.openingTime || !formData.closingTime) return setError('Please provide opening and closing times.') || false
        }
        return true
    }

    const nextStep = () => { setError(''); if (validate()) setStep(s => s + 1) }
    const prevStep = () => { setError(''); setStep(s => s - 1) }

    const handleSubmit = async () => {
        setError('')
        setLoading(true)
        try {
            const data = { ...formData }
            delete data.confirmPassword
            await canteenAuthService.register(data)
            setShowSuccess(true)
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const cuisineOptions = ['INDIAN', 'CHINESE', 'CONTINENTAL', 'ITALIAN', 'MEXICAN', 'BEVERAGES', 'SNACKS', 'DESSERTS']
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

    const inputCls = "w-full px-4 py-3 bg-[#0d0d0d] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition placeholder-gray-600 text-sm"
    const labelCls = "block text-sm font-bold text-gray-400 mb-2"

    return (
        <>
            <div className="min-h-screen bg-[#080808] font-sans text-white">

                {/* Top bar */}
                <div className="sticky top-0 z-50 bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.06]">
                    <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <span className="text-white font-black text-sm">C</span>
                            </div>
                            <span className="text-white font-black">CampusEats</span>
                            <span className="text-xs text-orange-400 font-bold bg-orange-500/15 border border-orange-500/25 px-2 py-0.5 rounded-full ml-1">Partner</span>
                        </Link>
                        <Link to="/canteen/login" className="text-sm text-gray-500 hover:text-white transition font-medium">
                            Already registered? Login →
                        </Link>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                            🏪 Partner Registration
                        </span>
                        <h1 className="text-4xl font-black tracking-tighter">Partner with CampusEats</h1>
                        <p className="text-gray-500 mt-2">Register your canteen in 4 simple steps</p>
                    </div>

                    {/* Step progress */}
                    <div className="flex items-center justify-center gap-0 mb-10">
                        {STEP_META.map((s, i) => (
                            <div key={s.label} className="flex items-center">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${i + 1 === step ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-900/30' : i + 1 < step ? 'bg-orange-500/20 text-orange-400' : 'bg-white/[0.04] text-gray-600'}`}>
                                    <span className="text-base">{s.icon}</span>
                                    <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">{s.label}</span>
                                </div>
                                {i < STEP_META.length - 1 && (
                                    <div className={`w-8 h-px mx-1 transition-all ${i + 1 < step ? 'bg-orange-500' : 'bg-white/[0.06]'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Card */}
                    <div className="bg-[#0f0f0f] border border-white/[0.07] rounded-3xl p-8 shadow-2xl">

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">

                            {/* ── Step 1: Owner Account ── */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <h3 className="text-lg font-black text-white border-b border-white/[0.07] pb-3 mb-5">👤 Owner Account Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Owner Name *</label>
                                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required className={inputCls} placeholder="Your full name" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Phone Number *</label>
                                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className={inputCls} placeholder="+94 77 000 0000" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Email *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputCls} placeholder="owner@canteen.com" />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Password *</label>
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" className={inputCls} placeholder="Min. 6 characters" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Confirm Password *</label>
                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputCls} placeholder="Repeat password" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Alternative Contact <span className="text-gray-600 font-normal">(Optional)</span></label>
                                        <input type="tel" name="alternativeContactNumber" value={formData.alternativeContactNumber} onChange={handleChange} className={inputCls} placeholder="+94 77 000 0000" />
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Canteen Info ── */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <h3 className="text-lg font-black text-white border-b border-white/[0.07] pb-3 mb-5">🏪 Canteen Information</h3>
                                    <div>
                                        <label className={labelCls}>Canteen Name *</label>
                                        <input type="text" name="canteenName" value={formData.canteenName} onChange={handleChange} required className={inputCls} placeholder="e.g., The Campus Kitchen" />
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <label className={labelCls}>Canteen Logo *</label>
                                        <div className="flex items-start gap-4">
                                            {formData.logoUrl && (
                                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/[0.1] flex-shrink-0">
                                                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setFormData(p => ({ ...p, logoUrl: '' }))}
                                                        className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-700">×</button>
                                                </div>
                                            )}
                                            <label className={`flex-1 flex flex-col items-center justify-center px-4 py-8 bg-[#0d0d0d] rounded-2xl border-2 border-dashed border-white/[0.1] cursor-pointer hover:border-orange-500/50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {uploading ? (
                                                    <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-500">Click to upload logo</span>
                                                        <span className="text-xs text-gray-700 mt-1">PNG, JPG up to 5MB</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" onChange={handleLogoUpload} disabled={uploading} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Campus</label>
                                            <input type="text" name="campus" value={formData.campus} onChange={handleChange} className={inputCls} placeholder="e.g., Main Campus" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Building/Location *</label>
                                            <input type="text" name="location" value={formData.location} onChange={handleChange} required className={inputCls} placeholder="e.g., Block A" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={labelCls}>Floor Number</label>
                                            <input type="text" name="floorNumber" value={formData.floorNumber} onChange={handleChange} className={inputCls} placeholder="e.g., 2" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Room/Shop No.</label>
                                            <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} className={inputCls} placeholder="e.g., 205" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Seating Capacity</label>
                                            <input type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} className={inputCls} placeholder="e.g., 50" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Description *</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" placeholder="Describe your canteen..."
                                            className={`${inputCls} resize-none`} />
                                    </div>

                                    <div>
                                        <label className={labelCls}>Cuisine Types</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {cuisineOptions.map(c => (
                                                <label key={c} className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${formData.cuisineTypes.includes(c) ? 'bg-orange-500/15 border-orange-500/40 text-orange-300' : 'bg-[#0d0d0d] border-white/[0.06] text-gray-500 hover:border-white/20'}`}>
                                                    <input type="checkbox" checked={formData.cuisineTypes.includes(c)}
                                                        onChange={() => handleCheckboxArray('cuisineTypes', c)} className="hidden" />
                                                    <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${formData.cuisineTypes.includes(c) ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}>
                                                        {formData.cuisineTypes.includes(c) && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                    </span>
                                                    <span className="text-xs font-bold">{c}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 3: Operations ── */}
                            {step === 3 && (
                                <div className="space-y-5">
                                    <h3 className="text-lg font-black text-white border-b border-white/[0.07] pb-3 mb-5">⚙️ Operational Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Opening Time *</label>
                                            <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required className={inputCls} style={{ colorScheme: 'dark' }} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Closing Time *</label>
                                            <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required className={inputCls} style={{ colorScheme: 'dark' }} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Operating Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {days.map(day => (
                                                <label key={day} className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-black transition-all border ${formData.operatingDays.includes(day) ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-900/30' : 'bg-[#0d0d0d] text-gray-500 border-white/[0.07] hover:border-white/20'}`}>
                                                    <input type="checkbox" checked={formData.operatingDays.includes(day)} onChange={() => handleCheckboxArray('operatingDays', day)} className="hidden" />
                                                    {day}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Avg. Preparation Time <span className="text-gray-600 font-normal">(minutes)</span></label>
                                        <input type="number" name="averagePreparationTime" value={formData.averagePreparationTime} onChange={handleChange} className={`${inputCls} w-40`} />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 bg-[#0d0d0d] border border-white/[0.07] p-5 rounded-2xl">
                                        {[
                                            { name: 'deliveryAvailable', label: 'Delivery Available', icon: '🛵' },
                                            { name: 'pickupAvailable', label: 'Pickup Available', icon: '🏃' },
                                        ].map(opt => (
                                            <label key={opt.name} className={`flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-xl border transition-all ${formData[opt.name] ? 'bg-orange-500/10 border-orange-500/30' : 'border-transparent hover:bg-white/[0.03]'}`}>
                                                <input type="checkbox" name={opt.name} checked={formData[opt.name]} onChange={handleChange} className="hidden" />
                                                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${formData[opt.name] ? 'bg-orange-500 border-orange-500' : 'border-white/20'}`}>
                                                    {formData[opt.name] && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </span>
                                                <span className="text-lg">{opt.icon}</span>
                                                <span className="text-white font-bold text-sm">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Step 4: Review ── */}
                            {step === 4 && (
                                <div className="space-y-5">
                                    <h3 className="text-lg font-black text-white border-b border-white/[0.07] pb-3 mb-5">✅ Review Your Application</h3>

                                    <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-6 space-y-4">
                                        <div>
                                            <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Owner</p>
                                            <p className="text-white font-semibold">{formData.ownerName}</p>
                                            <p className="text-gray-500 text-sm">{formData.email}</p>
                                        </div>
                                        <div className="border-t border-white/[0.06] pt-4 flex gap-4 items-center">
                                            {formData.logoUrl && (
                                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/[0.1] flex-shrink-0">
                                                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Canteen</p>
                                                <p className="text-white font-bold">{formData.canteenName}</p>
                                                <p className="text-gray-500 text-sm">{formData.location}{formData.campus ? ` (${formData.campus})` : ''}</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-white/[0.06] pt-4">
                                            <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Operations</p>
                                            <p className="text-white text-sm">{formData.openingTime} – {formData.closingTime}</p>
                                            <div className="flex gap-1.5 mt-2 flex-wrap">
                                                {formData.operatingDays.map(d => (
                                                    <span key={d} className="px-2 py-0.5 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs rounded-lg font-bold">{d}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-xl text-sm">
                                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p>Your application will be reviewed by our admin team. You'll receive an email notification upon approval — usually within 24 hours.</p>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between pt-4 border-t border-white/[0.06]">
                                {step > 1 ? (
                                    <button type="button" onClick={prevStep}
                                        className="px-6 py-3 bg-white/[0.06] border border-white/[0.08] text-white font-bold rounded-xl hover:bg-white/10 transition">
                                        ← Back
                                    </button>
                                ) : <div />}

                                {step < 4 ? (
                                    <button type="button" onClick={nextStep}
                                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:-translate-y-0.5 transition-all">
                                        Continue →
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleSubmit} disabled={loading}
                                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : 'Submit Application →'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* ── Success Modal ── */}
            {
                showSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                        {/* Card */}
                        <div className="relative bg-[#111] border border-white/[0.08] rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                            {/* Checkmark icon */}
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-black text-white tracking-tight mb-3">Application Submitted!</h2>
                            <p className="text-gray-400 leading-relaxed mb-2">
                                Thank you for partnering with <span className="text-orange-400 font-bold">CampusEats</span>. Your canteen registration is now under review.
                            </p>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Our admin team will verify your details and get back to you via email within <span className="text-white font-semibold">24–48 hours</span>. Please wait for approval before attempting to log in.
                            </p>

                            {/* Status badge */}
                            <div className="flex items-center justify-center gap-2 bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 px-4 py-2.5 rounded-xl mb-8">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-bold">Status: Pending Admin Approval</span>
                            </div>

                            <button
                                onClick={() => navigate('/canteen/login')}
                                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-orange-900/30 hover:-translate-y-0.5 transition-all">
                                Go to Login
                            </button>
                            <p className="text-xs text-gray-600 mt-4">You will not be able to log in until your application is approved.</p>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default CanteenRegister
