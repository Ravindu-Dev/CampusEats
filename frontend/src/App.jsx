import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
import notificationService from './services/notificationService'

// In-app notification toast for foreground push notifications
function NotificationToast({ notification, onClose }) {
    if (!notification) return null;

    return (
        <div
            onClick={() => {
                window.location.href = '/orders';
                onClose();
            }}
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 10000,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(255, 140, 0, 0.3)',
                borderRadius: '16px',
                padding: '16px 20px',
                maxWidth: '380px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 140, 0, 0.1)',
                cursor: 'pointer',
                animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                backdropFilter: 'blur(10px)',
                color: '#fff',
            }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff8c00, #ff6b00)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
            }}>
                🔔
            </div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: 700,
                    fontSize: '14px',
                    marginBottom: '4px',
                    color: '#ff8c00',
                }}>
                    {notification.title}
                </div>
                <div style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.4,
                }}>
                    {notification.body}
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0',
                    lineHeight: 1,
                    flexShrink: 0,
                }}
            >
                ✕
            </button>
        </div>
    );
}

function App() {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Listen for foreground push notifications
        const unsubscribe = notificationService.onForegroundMessage((payload) => {
            setNotification({
                title: payload.notification?.title || 'Order Update',
                body: payload.notification?.body || 'Your order has been updated!',
            });

            // Auto-dismiss after 5 seconds
            setTimeout(() => setNotification(null), 5000);
        });

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <style>{`
                        @keyframes slideInRight {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>
                    <NotificationToast
                        notification={notification}
                        onClose={() => setNotification(null)}
                    />
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


