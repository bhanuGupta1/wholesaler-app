// src/App.jsx - Fixed to stop automatic data generation
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
// REMOVED: import { seedFirebaseData } from './utils/seedFirebase';

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
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'));
const Orders = lazy(() => import('./pages/Orders'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const OrderDetails = lazy(() => import('./pages/Orders/OrderDetails'));
const InvoicePage = lazy(() => import('./pages/Orders/InvoicePage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Registration = lazy(() => import('./pages/Registration'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Determine user role based on email or you can fetch from Firestore
        if (currentUser.email?.includes('admin')) {
          setUserRole('admin');
        } else if (currentUser.email?.includes('manager')) {
          setUserRole('manager');
        } else if (currentUser.email?.includes('business')) {
          setUserRole('business');
        } else {
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route that doesn't require authentication
const PublicRoute = ({ children }) => {
  return children;
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
        // Determine user role based on email
        if (currentUser.email?.includes('admin')) {
          setUserRole('admin');
        } else if (currentUser.email?.includes('manager')) {
          setUserRole('manager');
        } else if (currentUser.email?.includes('business')) {
          setUserRole('business');
        } else {
          setUserRole('user');
        }
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
      return <ManagerDashboard />; // Simple manager dashboard
    case 'business':
      return <BusinessDashboard />;
    case 'user':
      return <UserDashboard />; // Simple user dashboard
    case 'guest':
    default:
      return <GuestDashboard />;
  }
};

function App() {
  // REMOVED ALL SEEDING STATE:
  // const [isSeeding, setIsSeeding] = useState(false);
  // const [seedStatus, setSeedStatus] = useState('');
  // const [seedError, setSeedError] = useState(null);
  // const [showSeedOption, setShowSeedOption] = useState(false);
  
  // REMOVED DATABASE CHECKING LOGIC:
  // useEffect(() => {
  //   async function checkDatabase() {
  //     try {
  //       // First just check if data exists (forceReseed = false)
  //       const result = await seedFirebaseData(false);
  //       
  //       // If empty database, show option to seed
  //       if (!result) {
  //         setShowSeedOption(true);
  //       }
  //     } catch (error) {
  //       console.error('Error checking database:', error);
  //       setSeedError(error.message);
  //     }
  //   }
  //
  //   checkDatabase();
  // }, []);

  // REMOVED SEEDING FUNCTIONS:
  // const handleSeedData = async () => { ... }

  // REMOVED ALL SEEDING UI SCREENS:
  // if (isSeeding) { ... }
  // if (showSeedOption) { ... }
  // if (seedError) { ... }

  // Main application render - No seeding logic
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Home Route - Default landing page for everyone */}
              <Route path="/" element={
                <PublicRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </PublicRoute>
              } />

              {/* Public Routes - No authentication required */}
              <Route path="/login" element={<Login />} />
              
              <Route path="/register" element={
                <PublicRoute>
                  <Registration />
                </PublicRoute>
              } />

              {/* Guest accessible routes */}
              <Route path="/guest-dashboard" element={
                <PublicRoute>
                  <Layout>
                    <GuestDashboard />
                  </Layout>
                </PublicRoute>
              } />

              <Route path="/catalog" element={
                <PublicRoute>
                  <Layout>
                    <ProductCatalog />
                  </Layout>
                </PublicRoute>
              } />

              {/* Dashboard Route - Role-based for authenticated users */}
              <Route path="/dashboard" element={
                <Layout>
                  <DashboardRouter />
                </Layout>
              } />

              {/* Role-specific dashboard routes */}
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

              {/* Enhanced Dashboard Routes for Advanced Users */}
              <Route path="/enhanced-dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <EnhancedDashboard />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Inventory routes - accessible by all authenticated users and guests */}
              <Route path="/inventory" element={
                <Layout>
                  <Inventory />
                </Layout>
              } />
              
              <Route path="/inventory/:id" element={
                <Layout>
                  <ProductDetail />
                </Layout>
              } />

              {/* Products/Browse route - Main products page for everyone */}
              <Route path="/products" element={
                <PublicRoute>
                  <Layout>
                    <GuestDashboard />
                  </Layout>
                </PublicRoute>
              } />

              <Route path="/browse" element={
                <PublicRoute>
                  <Layout>
                    <GuestDashboard />
                  </Layout>
                </PublicRoute>
              } />

              {/* Shopping routes - accessible by all */}
              <Route path="/cart" element={
                <PublicRoute>
                  <Layout>
                    <Cart />
                  </Layout>
                </PublicRoute>
              } />

              <Route path="/checkout" element={
                <PublicRoute>
                  <Layout>
                    <Checkout />
                  </Layout>
                </PublicRoute>
              } />
              
              {/* Orders routes - Protected (Login required) */}
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Layout>
                    <Orders />
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
                <ProtectedRoute>
                  <Layout>
                    <CreateOrder />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Fallback route - redirect to home instead of dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;