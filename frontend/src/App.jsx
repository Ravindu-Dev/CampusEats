import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Cart from './components/Cart'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CanteenLogin from './pages/CanteenLogin'
import CanteenRegister from './pages/CanteenRegister'
import CanteenDashboard from './pages/CanteenDashboard'
import Menu from './pages/Menu'
import Reviews from './pages/Reviews'
import Contact from './pages/Contact'
import About from './pages/About'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import PendingApprovals from './pages/admin/PendingApprovals'
import AllCanteenOwners from './pages/admin/AllCanteenOwners'
import AllCanteens from './pages/admin/AllCanteens'
import MenuManagement from './pages/MenuManagement'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import CanteenOrders from './pages/CanteenOrders'

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/canteen/login" element={<CanteenLogin />} />
                        <Route path="/canteen/register" element={<CanteenRegister />} />
                        <Route path="/canteen/dashboard" element={<CanteenDashboard />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/pending-approvals" element={<PendingApprovals />} />
                        <Route path="/admin/canteen-owners" element={<AllCanteenOwners />} />
                        <Route path="/admin/canteens" element={<AllCanteens />} />
                        <Route path="/canteen/menu-management" element={<MenuManagement />} />
                        <Route path="/canteen/orders" element={<CanteenOrders />} />
                        <Route path="/checkout" element={<Checkout />} />
                    </Routes>
                    <Cart />
                </Router>
            </CartProvider>
        </AuthProvider>
    )
}

export default App
