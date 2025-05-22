// src/App.jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { seedFirebaseData } from './utils/seedFirebase';

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
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');
  const [seedError, setSeedError] = useState(null);
  const [showSeedOption, setShowSeedOption] = useState(false);
  
  // Check if seeding is needed on app start
  useEffect(() => {
    async function checkDatabase() {
      try {
        // First just check if data exists (forceReseed = false)
        const result = await seedFirebaseData(false);
        
        // If empty database, show option to seed
        if (!result) {
          setShowSeedOption(true);
        }
      } catch (error) {
        console.error('Error checking database:', error);
        setSeedError(error.message);
      }
    }

    checkDatabase();
  }, []);

  // Handle manual seed request
  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      setSeedStatus('Creating sample data...');
      
      // Force reseed of the database
      await seedFirebaseData(true);
      
      setIsSeeding(false);
      setSeedStatus('Data successfully created!');
      setShowSeedOption(false);
      
      // Refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error seeding data:', error);
      setSeedError(error.message);
      setIsSeeding(false);
    }
  };

  // Show loading screen while seeding data
  if (isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">{seedStatus}</p>
        <p className="mt-2 text-gray-500 text-sm">This may take a moment...</p>
      </div>
    );
  }

  // Show seed option screen if database is empty
  if (showSeedOption) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Initialize Application</h2>
          <p className="text-gray-600 mb-6">
            Your database appears to be empty. Would you like to create sample data for testing?
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={handleSeedData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Create Sample Data
            </button>
            <button 
              onClick={() => setShowSeedOption(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Continue Without Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen if seeding failed
  if (seedError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded shadow-md max-w-md">
          <h2 className="font-bold text-xl mb-2">Error Initializing Application</h2>
          <p className="mb-4">{seedError}</p>
          <p className="text-sm mb-4">
            Please check your Firebase configuration and make sure you have the proper permissions.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main application render
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
              
              {/* Orders routes - Protected */}
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