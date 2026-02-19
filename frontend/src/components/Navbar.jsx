import { useState, useContext, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Navbar({ isHome = false }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { user, logout } = useContext(AuthContext)
    const { itemCount, toggleCart } = useCart()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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

    // isTransparent = only at very top of home page (fully see-through bg)
    // isHome = entire home page (dark theme throughout, white text always)
    const isTransparent = isHome && !scrolled

    return (
        <nav
            className={`top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isHome
                    ? isTransparent
                        ? 'fixed bg-transparent border-white/10 py-4'
                        : 'fixed bg-black/85 backdrop-blur-xl border-white/10 shadow-lg py-2'
                    : scrolled
                        ? 'sticky bg-white/95 backdrop-blur-xl border-gray-200 shadow-sm py-2'
                        : 'sticky bg-white/80 backdrop-blur-lg border-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300 transform group-hover:scale-105">
                                C
                            </div>
                            <span className={`text-2xl font-black tracking-tight transition-all duration-300 ${isHome
                                    ? 'text-white'
                                    : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-red-600'
                                }`}>
                                CampusEats
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 relative group ${isHome
                                        ? isActive(link.path)
                                            ? 'text-orange-400 bg-white/10'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                        : isActive(link.path)
                                            ? 'text-orange-600 bg-orange-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {link.name}
                                {isActive(link.path) && (
                                    <span className={`absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isHome ? 'bg-orange-400' : 'bg-orange-600'
                                        }`}></span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-5">
                        {user ? (
                            <>
                                <button
                                    onClick={toggleCart}
                                    className={`relative p-2.5 rounded-full transition-all duration-300 group ${isHome
                                            ? 'text-white/80 hover:text-white hover:bg-white/10'
                                            : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                    aria-label="Cart"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {itemCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full ring-2 ring-white shadow-sm transform group-hover:scale-110 transition-transform">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>

                                <Link
                                    to="/dashboard"
                                    className={`p-2.5 rounded-full transition-all duration-300 group ${isHome
                                            ? 'text-white/80 hover:text-white hover:bg-white/10'
                                            : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                    aria-label="Dashboard"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </Link>

                                <div className={`h-6 w-px ${isHome ? 'bg-white/20' : 'bg-gray-200'}`}></div>

                                <div className="flex items-center gap-3 pl-2">
                                    <div className="text-right hidden lg:block">
                                        <div className={`text-xs font-medium uppercase tracking-wider ${isHome ? 'text-white/40' : 'text-gray-400'}`}>Welcome</div>
                                        <div className={`text-sm font-bold leading-none ${isHome ? 'text-white' : 'text-gray-900'}`}>{user.username}</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className={`px-5 py-2.5 font-bold text-sm transition-colors ${isHome ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-bold rounded-full shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        {user && (
                            <button
                                onClick={toggleCart}
                                className="relative p-2 text-gray-600"
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
                            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div
                className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4 space-y-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${isActive(link.path)
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {link.name}
                            {isActive(link.path) && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </Link>
                    ))}

                    <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log Out ({user.username})
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 text-center text-gray-700 bg-gray-50 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 text-center text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
