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
import CanteenReviews from './pages/CanteenReviews'
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
import KitchenDashboard from './pages/KitchenDashboard'
import OrderTracking from './pages/OrderTracking'
import MyReviews from './pages/MyReviews'
import ScanQRPage from './pages/ScanQRPage'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import StaffManagement from './pages/StaffManagement'
import AttendanceManagement from './pages/AttendanceManagement'
import CanteenPayroll from './pages/CanteenPayroll'
import PayrollDetail from './pages/PayrollDetail'
import AdminPayroll from './pages/admin/AdminPayroll'
import PayrollConfig from './pages/admin/PayrollConfig'
import PayrollReview from './pages/admin/PayrollReview'

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
                        <Route path="/my-reviews" element={<MyReviews />} />
                        <Route path="/canteen/login" element={<CanteenLogin />} />
                        <Route path="/canteen/register" element={<CanteenRegister />} />
                        <Route path="/canteen/dashboard" element={<CanteenDashboard />} />
                        <Route path="/canteen/reviews" element={<CanteenReviews />} />
                        <Route path="/canteen/scan-qr" element={<ScanQRPage />} />
                        <Route path="/canteen/staff" element={<StaffManagement />} />
                        <Route path="/canteen/attendance" element={<AttendanceManagement />} />
                        <Route path="/canteen/payroll" element={<CanteenPayroll />} />
                        <Route path="/canteen/payroll/:id" element={<PayrollDetail />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/pending-approvals" element={<PendingApprovals />} />
                        <Route path="/admin/canteen-owners" element={<AllCanteenOwners />} />
                        <Route path="/admin/canteens" element={<AllCanteens />} />
                        <Route path="/admin/payroll" element={<AdminPayroll />} />
                        <Route path="/admin/payroll/config" element={<PayrollConfig />} />
                        <Route path="/admin/payroll/:id" element={<PayrollReview />} />
                        <Route path="/canteen/menu-management" element={<MenuManagement />} />
                        <Route path="/canteen/orders" element={<CanteenOrders />} />
                        <Route path="/canteen/kitchen" element={<KitchenDashboard />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders/track/:orderId" element={<OrderTracking />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                    </Routes>
                    <Cart />
                </Router>
            </CartProvider>
        </AuthProvider>
    )
}

export default App

