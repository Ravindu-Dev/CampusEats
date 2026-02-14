import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-2xl font-black text-gray-900 mb-6">Campus<span className="text-orange-600">Eats</span>.</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Redefining the way you eat on campus. Fast, reliable, and delicious.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Explore</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><Link to="/menu" className="hover:text-orange-600 transition-colors">Our Menu</Link></li>
                            <li><Link to="/reviews" className="hover:text-orange-600 transition-colors">Reviews</Link></li>
                            <li><Link to="/about" className="hover:text-orange-600 transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Partners</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><Link to="/canteen/register" className="hover:text-orange-600 transition-colors">Canteen Registration</Link></li>
                            <li><Link to="/canteen/login" className="hover:text-orange-600 transition-colors">Partner Login</Link></li>
                            <li><Link to="/admin/login" className="hover:text-orange-600 transition-colors">Admin Portal</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><Link to="#" className="hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-orange-600 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">© 2026 CampusEats. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
