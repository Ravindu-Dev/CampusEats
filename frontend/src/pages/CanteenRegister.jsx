import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
            <Navbar />
            <div className="py-12 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Register Your Canteen</h1>
                        <p className="text-gray-600 text-lg">Step {step} of 4</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            <span className={step >= 1 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>Account</span>
                            <span className={step >= 2 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>Basic Info</span>
                            <span className={step >= 3 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>Operations</span>
                            <span className={step >= 4 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>Review</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }}></div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Owner Account Details */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Owner Account Details</h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Name *</label>
                                        <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alternative Contact (Optional)</label>
                                    <input type="tel" name="alternativeContactNumber" value={formData.alternativeContactNumber} onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Canteen Basic Info */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Canteen Basic Information</h2>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Canteen Name *</label>
                                    <input type="text" name="canteenName" value={formData.canteenName} onChange={handleChange} required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Campus</label>
                                        <input type="text" name="campus" value={formData.campus} onChange={handleChange}
                                            placeholder="e.g., Main Campus"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Building/Location *</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                            placeholder="e.g., Block A"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Floor Number</label>
                                        <input type="text" name="floorNumber" value={formData.floorNumber} onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Room/Shop Number</label>
                                        <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seating Capacity</label>
                                        <input type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark/Directions</label>
                                    <input type="text" name="landmark" value={formData.landmark} onChange={handleChange}
                                        placeholder="e.g., Near Library Entrance"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                                        placeholder="Describe your canteen, specialties, etc."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900"></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cuisine Types</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {cuisineOptions.map(cuisine => (
                                            <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" checked={formData.cuisineTypes.includes(cuisine)}
                                                    onChange={() => handleCheckboxArray('cuisineTypes', cuisine)}
                                                    className="rounded text-orange-600 focus:ring-orange-500" />
                                                <span className="text-sm text-gray-900">{cuisine}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dietary Options</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {dietaryOptions.map(option => (
                                            <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" checked={formData.dietaryOptions.includes(option)}
                                                    onChange={() => handleCheckboxArray('dietaryOptions', option)}
                                                    className="rounded text-orange-600 focus:ring-orange-500" />
                                                <span className="text-sm text-gray-900">{option.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty Items</label>
                                    <input type="text" name="specialtyItems" value={formData.specialtyItems} onChange={handleChange}
                                        placeholder="e.g., Famous for dosas and filter coffee"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Operational Details */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Operational Details</h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Opening Time *</label>
                                        <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Closing Time *</label>
                                        <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Operating Days</label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {days.map(day => (
                                            <label key={day} className="flex flex-col items-center space-y-1 cursor-pointer">
                                                <input type="checkbox" checked={formData.operatingDays.includes(day)}
                                                    onChange={() => handleCheckboxArray('operatingDays', day)}
                                                    className="rounded text-orange-600 focus:ring-orange-500" />
                                                <span className="text-xs text-gray-900">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Average Preparation Time (minutes)</label>
                                    <input type="number" name="averagePreparationTime" value={formData.averagePreparationTime} onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" name="deliveryAvailable" checked={formData.deliveryAvailable} onChange={handleChange}
                                            className="rounded text-orange-600 focus:ring-orange-500 h-5 w-5" />
                                        <span className="font-medium text-gray-900">Delivery Available</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" name="pickupAvailable" checked={formData.pickupAvailable} onChange={handleChange}
                                            className="rounded text-orange-600 focus:ring-orange-500 h-5 w-5" />
                                        <span className="font-medium text-gray-900">Pickup Available</span>
                                    </label>
                                </div>

                                <div className="border-t pt-6 mt-6">
                                    <h3 className="text-lg font-semibold mb-4">Business Information (Optional)</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Registration Number</label>
                                            <input type="text" name="businessRegistrationNumber" value={formData.businessRegistrationNumber} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number</label>
                                            <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Food Safety License</label>
                                            <input type="text" name="foodSafeLicenseNumber" value={formData.foodSafeLicenseNumber} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6 mt-6">
                                    <h3 className="text-lg font-semibold mb-4">Banking Details (Optional)</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                                            <input type="text" name="bankName" value={formData.bankName} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Holder Name</label>
                                            <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                                            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">IFSC Code</label>
                                            <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID</label>
                                            <input type="text" name="upiId" value={formData.upiId} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm text-gray-900" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Your Information</h2>

                                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Owner Details</h3>
                                        <p><span className="font-medium">Name:</span> {formData.ownerName}</p>
                                        <p><span className="font-medium">Email:</span> {formData.email}</p>
                                        <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold text-lg mb-2">Canteen Details</h3>
                                        <p><span className="font-medium">Name:</span> {formData.canteenName}</p>
                                        <p><span className="font-medium">Location:</span> {formData.location} {formData.campus && `(${formData.campus})`}</p>
                                        <p><span className="font-medium">Description:</span> {formData.description}</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold text-lg mb-2">Operating Hours</h3>
                                        <p><span className="font-medium">Hours:</span> {formData.openingTime} - {formData.closingTime}</p>
                                        <p><span className="font-medium">Days:</span> {formData.operatingDays.join(', ')}</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        Your canteen registration will be reviewed by our admin team. You'll be notified once approved.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {step > 1 && (
                                <button type="button" onClick={prevStep}
                                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-900 transition shadow-sm">
                                    Previous
                                </button>
                            )}

                            {step < 4 ? (
                                <button type="button" onClick={nextStep}
                                    className="ml-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition">
                                    Next
                                </button>
                            ) : (
                                <button type="submit" disabled={loading}
                                    className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Submitting...' : 'Submit Registration'}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/canteen/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                            Login here
                        </a>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                        <a href="/" className="text-sm text-gray-600 hover:text-gray-700">
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CanteenRegister
