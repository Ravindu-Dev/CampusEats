import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'
import canteenAdminService from '../../services/canteenAdminService'

function AllCanteens() {
    const [canteens, setCanteens] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center space-x-2">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-lg font-semibold text-gray-700">Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 text-white mb-8">
                    <h1 className="text-4xl font-bold mb-2">Canteens</h1>
                    <p className="text-lg opacity-90">Manage and view all canteens on the platform</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="text-gray-600 font-medium">
                            Total: {filteredCanteens.length} canteens
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCanteens.map((canteen) => (
                            <div key={canteen.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 overflow-hidden group">
                                <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                        {canteen.canteenName}
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm">{canteen.location}, {canteen.campus}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm">{canteen.openingTime} - {canteen.closingTime}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span className="text-sm">{canteen.phoneNumber}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${canteen.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {canteen.active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                        <button className="text-orange-600 font-semibold text-sm hover:text-orange-700">
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default AllCanteens
