// src/App.jsx - Updated with enhanced approval system and admin routes
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ProtectedRoute from './components/common/ProtectedRoute';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Lazy-loaded components for better performance
const EnhancedDashboard = lazy(() => import('./pages/EnhancedDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const Home = lazy(() => import('./pages/Home'));
const Inventory = lazy(() => import('./pages/Inventory'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'));
const Orders = lazy(() => import('./pages/Orders'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const OrderDetails = lazy(() => import('./pages/Orders/OrderDetails'));
const InvoicePage = lazy(() => import('./pages/Orders/InvoicePage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Admin components
const UserApprovalDashboard = lazy(() => import('./pages/admin/UserApprovalDashboard'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));

// User-specific components
const UserSpecificOrders = lazy(() => import('./components/UserSpecificOrders'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

// Helper function to determine user role
const getUserRole = (user) => {
  if (!user) return null;
  
  if (user.email?.includes('admin')) {
    return 'admin';
  } else if (user.email?.includes('manager')) {
    return 'manager';
  } else if (user.email?.includes('business')) {
    return 'business';
  } else {
    return 'user';
  }
};

// Role-based Dashboard Router
const DashboardRouter = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const role = getUserRole(currentUser);
        setUserRole(role);
      } else {
        setUserRole('guest');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  // Return appropriate dashboard based on user role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'business':
      return <BusinessDashboard />;
    case 'user':
      return <UserDashboard />;
    case 'guest':
    default:
      return <GuestDashboard />;
  }
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes - No authentication required */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                
                {/* Home Route - Default landing page for everyone */}
                <Route path="/" element={
                  <Layout>
                    <Home />
                  </Layout>
                } />

                {/* Guest accessible routes */}
                <Route path="/guest-dashboard" element={
                  <Layout>
                    <GuestDashboard />
                  </Layout>
                } />

                <Route path="/catalog" element={
                  <Layout>
                    <ProductCatalog />
                  </Layout>
                } />

                <Route path="/products" element={
                  <Layout>
                    <ProductCatalog />
                  </Layout>
                } />

                <Route path="/products/:id" element={
                  <Layout>
                    <ProductDetails />
                  </Layout>
                } />

                <Route path="/browse" element={
                  <Layout>
                    <ProductCatalog />
                  </Layout>
                } />

                {/* Shopping routes - accessible by all */}
                <Route path="/cart" element={
                  <Layout>
                    <Cart />
                  </Layout>
                } />

                <Route path="/checkout" element={
                  <Layout>
                    <Checkout />
                  </Layout>
                } />

                {/* Dashboard Route - Role-based for authenticated users */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardRouter />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Role-specific dashboard routes with access control */}
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/business-dashboard" element={
                  <ProtectedRoute requiredRole="business">
                    <Layout>
                      <BusinessDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/manager-dashboard" element={
                  <ProtectedRoute requiredRole="manager">
                    <Layout>
                      <ManagerDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/user-dashboard" element={
                  <ProtectedRoute requiredRole="user">
                    <Layout>
                      <UserDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Enhanced Dashboard Routes - RESTRICTED to Admin and Manager only */}
                <Route path="/enhanced-dashboard" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Layout>
                      <EnhancedDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Admin Routes - Admin access only */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Routes>
                        <Route index element={<AdminPanel />} />
                        <Route path="users" element={<UserApprovalDashboard />} />
                        <Route path="approvals" element={<UserApprovalDashboard />} />
                        <Route path="pending-approvals" element={<UserApprovalDashboard />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* User Management - Admin and Manager access */}
                <Route path="/user-management" element={
                  <ProtectedRoute 
                    allowedRoles={['admin', 'manager']} 
                    requiredPermission="canApproveUsers"
                  >
                    <Layout>
                      <UserApprovalDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Inventory routes - Different access levels based on role */}
                <Route path="/inventory" element={
                  <ProtectedRoute requiredPermission="canManageInventory">
                    <Layout>
                      <Inventory />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory/:id" element={
                  <ProtectedRoute requiredPermission="canManageInventory">
                    <Layout>
                      <ProductDetail />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Orders routes - Protected with user-specific filtering */}
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Layout>
                      <UserSpecificOrders />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <OrderDetails />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/generate-invoice/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <InvoicePage />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/create-order" element={
                  <ProtectedRoute requiredPermission="canCreateOrders">
                    <Layout>
                      <CreateOrder />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Manager-only routes */}
                <Route path="/manager/*" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Layout>
                      <div className="p-8">
                        <h1 className="text-2xl font-bold mb-4">Manager Panel</h1>
                        <p>Manager-specific features would go here.</p>
                        <div className="mt-6 space-y-2">
                          <a href="/admin/users" className="block text-indigo-600 hover:text-indigo-800">Manage Users</a>
                          <a href="/inventory" className="block text-indigo-600 hover:text-indigo-800">Manage Inventory</a>
                          <a href="/orders" className="block text-indigo-600 hover:text-indigo-800">View All Orders</a>
                        </div>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Business-specific routes */}
                <Route path="/business/*" element={
                  <ProtectedRoute requiredRole="business">
                    <Layout>
                      <div className="p-8">
                        <h1 className="text-2xl font-bold mb-4">Business Panel</h1>
                        <p>Business-specific features based on buyer/seller type would go here.</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Fallback route - redirect to home instead of dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;