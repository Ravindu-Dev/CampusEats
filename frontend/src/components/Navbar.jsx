import { useState, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, logout } = useContext(AuthContext)
    const { itemCount, toggleCart } = useCart()
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path) => location.pathname === path

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Food Menu', path: '/menu' },
        { name: 'Reviews', path: '/reviews' },
        { name: 'Contact', path: '/contact' },
        { name: 'About Us', path: '/about' },
    ]

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent transform hover:scale-105 transition">
                                CampusEats
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-bold tracking-wide transition-all ${isActive(link.path)
                                        ? 'text-orange-600 border-b-2 border-orange-600 py-1'
                                        : 'text-gray-600 hover:text-orange-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons / Cart */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <button
                                    onClick={toggleCart}
                                    className="relative p-2 text-gray-700 hover:text-orange-600 transition group"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {itemCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>
                                <span className="text-gray-400">|</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-gray-700">Hey, {user.username}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-2">
                        {user && (
                            <button
                                onClick={toggleCart}
                                className="relative p-2 text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {itemCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${isActive(link.path)
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                toggleCart()
                                                setIsMenuOpen(false)
                                            }}
                                            className="w-full px-4 py-2 flex items-center justify-between text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>🛒 Your Cart</span>
                                                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                                    {itemCount}
                                                </span>
                                            </div>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition text-center"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-2 text-center text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-2 text-center bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-semibold"
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
