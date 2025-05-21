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
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EnhancedDashboard = lazy(() => import('./pages/EnhancedDashboard'));
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Orders = lazy(() => import('./pages/Orders/OrdersPage'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const OrderDetails = lazy(() => import('./pages/Orders/OrderDetails'));
const InvoicePage = lazy(() => import('./pages/Orders/InvoicePage'));
const OrderTable = lazy(() => import('./pages/Orders/OrderTable'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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

  return children;
};

function App() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');
  const [seedError, setSeedError] = useState(null);
  const [showSeedOption, setShowSeedOption] = useState(false);
  const [userRole, setUserRole] = useState('guest'); // Default to guest
  
  // Check if seeding is needed and determine user role on app start
  useEffect(() => {
    async function checkDatabase() {
      try {
        // First just check if data exists (forceReseed = false)
        const result = await seedFirebaseData(false);
        
        // If empty database, show option to seed
        if (!result) {
          setShowSeedOption(true);
        }
        
        // Set up auth state listener to determine role
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // In a real app, you would check the user's role in Firestore
            // For demo purposes, using email to determine role
            if (user.email?.includes('admin')) {
              setUserRole('admin');
            } else if (user.email?.includes('manager')) {
              setUserRole('manager');
            } else {
              setUserRole('user');
            }
          } else {
            setUserRole('guest');
          }
        });
        
        return () => unsubscribe();
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
              {/* Public route - Login */}
              <Route path="/login" element={<Login />} />
              
              {/* Different dashboard based on user role */}
              <Route path="/" element={
                userRole === 'guest' ? (
                  <Layout>
                    <GuestDashboard />
                  </Layout>
                ) : (
                  <ProtectedRoute>
                    <Layout>
                      {userRole === 'admin' || userRole === 'manager' ? (
                        <EnhancedDashboard />
                      ) : (
                        <Dashboard />
                      )}
                    </Layout>
                  </ProtectedRoute>
                )
              } />
              
              {/* Protected routes */}
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <Layout>
                    <Inventory />
                  </Layout>
                </ProtectedRoute>
              } />
              
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
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;