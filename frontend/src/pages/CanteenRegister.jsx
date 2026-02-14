import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'
import Navbar from '../components/Navbar'

function CanteenRegister() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        // Owner Account
        ownerName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        alternativeContactNumber: '',

        // Canteen Basic
        canteenName: '',
        campus: '',
        location: '',
        floorNumber: '',
        roomNumber: '',
        landmark: '',
        description: '',

        // Operational
        openingTime: '08:00',
        closingTime: '18:00',
        operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        averagePreparationTime: 15,
        deliveryAvailable: false,
        pickupAvailable: true,
        seatingCapacity: '',

        // Categories
        cuisineTypes: [],
        specialtyItems: '',
        dietaryOptions: [],

        // Business Info
        businessRegistrationNumber: '',
        gstNumber: '',
        foodSafeLicenseNumber: '',

        // Banking
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        acceptedPaymentMethods: ['CASH', 'CARD', 'UPI'],

        // Social
        websiteUrl: '',
        instagramHandle: '',
        facebookPage: '',
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        })
    }

    const handleCheckboxArray = (name, value) => {
        const currentArray = formData[name] || []
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value]
        setFormData({ ...formData, [name]: newArray })
    }

    const validateStep1 = () => {
        if (!formData.ownerName || !formData.email || !formData.password || !formData.phoneNumber) {
            setError('Please fill in all required fields')
            return false
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return false
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return false
        }
        return true
    }

    const validateStep2 = () => {
        if (!formData.canteenName || !formData.location || !formData.description) {
            setError('Please fill in all required fields (Name, Location, Description)')
            return false
        }
        return true
    }

    const validateStep3 = () => {
        if (!formData.openingTime || !formData.closingTime) {
            setError('Please provide opening and closing times')
            return false
        }
        return true
    }

    const nextStep = () => {
        setError('')

        if (step === 1 && !validateStep1()) return
        if (step === 2 && !validateStep2()) return
        if (step === 3 && !validateStep3()) return

        setStep(step + 1)
    }

    const prevStep = () => {
        setError('')
        setStep(step - 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const submitData = { ...formData }
            delete submitData.confirmPassword
            await canteenAuthService.register(submitData)
            navigate('/canteen/login', { state: { message: 'Registration successful! Please login.' } })
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const cuisineOptions = ['INDIAN', 'CHINESE', 'CONTINENTAL', 'ITALIAN', 'MEXICAN', 'BEVERAGES', 'SNACKS', 'DESSERTS']
    const dietaryOptions = ['VEGETARIAN', 'VEGAN', 'HALAL', 'GLUTEN_FREE']
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

    return (
        <div className="min-h-screen relative font-sans">
            <Navbar />

            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop"
                    alt="Canteen Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
                <div className="w-full max-w-4xl">
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Partner with CampusEats</h2>
                            <p className="text-gray-600">Register your canteen in 4 simple steps</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between mb-2 text-sm font-semibold">
                                <span className={step >= 1 ? 'text-orange-600' : 'text-gray-400'}>Account</span>
                                <span className={step >= 2 ? 'text-orange-600' : 'text-gray-400'}>Basic Info</span>
                                <span className={step >= 3 ? 'text-orange-600' : 'text-gray-400'}>Operations</span>
                                <span className={step >= 4 ? 'text-orange-600' : 'text-gray-400'}>Review</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-orange-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${(step / 4) * 100}%` }}></div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Step 1: Owner Account Details */}
                            {step === 1 && (
                                <div className="space-y-5 animate-fade-in-up">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Owner Account Details</h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Owner Name *</label>
                                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Password *</label>
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password *</label>
                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Alternative Contact (Optional)</label>
                                        <input type="tel" name="alternativeContactNumber" value={formData.alternativeContactNumber} onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Canteen Basic Info */}
                            {step === 2 && (
                                <div className="space-y-5 animate-fade-in-up">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Canteen Basic Information</h3>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Canteen Name *</label>
                                        <input type="text" name="canteenName" value={formData.canteenName} onChange={handleChange} required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Campus</label>
                                            <input type="text" name="campus" value={formData.campus} onChange={handleChange}
                                                placeholder="e.g., Main Campus"
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Building/Location *</label>
                                            <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                                placeholder="e.g., Block A"
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Floor Number</label>
                                            <input type="text" name="floorNumber" value={formData.floorNumber} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Room/Shop Number</label>
                                            <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Seating Capacity</label>
                                            <input type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="3"
                                            placeholder="Describe your canteen..."
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none"></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Cuisine Types</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {cuisineOptions.map(cuisine => (
                                                <label key={cuisine} className="flex items-center space-x-2 cursor-pointer bg-gray-50 p-2 rounded-lg hover:bg-orange-50 transition">
                                                    <input type="checkbox" checked={formData.cuisineTypes.includes(cuisine)}
                                                        onChange={() => handleCheckboxArray('cuisineTypes', cuisine)}
                                                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4" />
                                                    <span className="text-sm font-medium text-gray-700">{cuisine}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Operational Details */}
                            {step === 3 && (
                                <div className="space-y-5 animate-fade-in-up">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Operational Details</h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Opening Time *</label>
                                            <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Closing Time *</label>
                                            <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Operating Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {days.map(day => (
                                                <label key={day} className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.operatingDays.includes(day) ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                    <input type="checkbox" checked={formData.operatingDays.includes(day)}
                                                        onChange={() => handleCheckboxArray('operatingDays', day)}
                                                        className="hidden" />
                                                    {day}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Avg. Prep Time (mins)</label>
                                        <input type="number" name="averagePreparationTime" value={formData.averagePreparationTime} onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input type="checkbox" name="deliveryAvailable" checked={formData.deliveryAvailable} onChange={handleChange}
                                                className="rounded text-orange-600 focus:ring-orange-500 h-5 w-5" />
                                            <span className="font-bold text-gray-800">Delivery Available</span>
                                        </label>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input type="checkbox" name="pickupAvailable" checked={formData.pickupAvailable} onChange={handleChange}
                                                className="rounded text-orange-600 focus:ring-orange-500 h-5 w-5" />
                                            <span className="font-bold text-gray-800">Pickup Available</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Review */}
                            {step === 4 && (
                                <div className="space-y-6 animate-fade-in-up">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Review Your Information</h3>

                                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Owner</h4>
                                            <p className="text-gray-700">{formData.ownerName} <span className="text-gray-400">|</span> {formData.email}</p>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Canteen Details</h4>
                                            <p className="font-semibold text-lg">{formData.canteenName}</p>
                                            <p className="text-gray-600 text-sm">{formData.location} {formData.campus && `(${formData.campus})`}</p>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Operations</h4>
                                            <p className="text-gray-700">{formData.openingTime} - {formData.closingTime}</p>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {formData.operatingDays.map(day => (
                                                    <span key={day} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-bold">{day}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <p className="text-sm text-blue-800 font-medium">
                                            Your application will be reviewed by our admin team. You'll receive an email notification upon approval.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-4 border-t border-gray-200/50">
                                {step > 1 && (
                                    <button type="button" onClick={prevStep}
                                        className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-bold transition">
                                        Back
                                    </button>
                                )}

                                {step < 4 ? (
                                    <button type="button" onClick={nextStep}
                                        className="ml-auto px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                                        Next
                                    </button>
                                ) : (
                                    <button type="submit" disabled={loading}
                                        className="ml-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {loading ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <Link to="/canteen/login" className="text-orange-600 font-bold hover:underline">
                                Already have an account? Login here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CanteenRegister
