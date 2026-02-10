import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import canteenAuthService from '../services/canteenAuthService'

function CanteenLogin() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await canteenAuthService.login(formData)
            navigate('/canteen/dashboard')
        } catch (err) {
            setError(err.response?.data || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">CampusEats</h1>
                    <p className="text-gray-600 mt-2">Canteen Owner Login</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don't have a canteen?{' '}
                        <Link to="/canteen/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                            Register your canteen
                        </Link>
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-gray-700">
                        ← Back to Customer Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default CanteenLogin
