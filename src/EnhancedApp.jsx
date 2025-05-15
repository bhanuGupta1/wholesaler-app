// src/EnhancedApp.jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import { seedFirebaseData } from './utils/seedFirebase';
import { generateFakerData } from './utils/fakerData';

// Lazy-loaded components for better performance
const EnhancedDashboard = lazy(() => import('./pages/EnhancedDashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Orders = lazy(() => import('./pages/Orders'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

function EnhancedApp() {
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

  // Handle manual seed request with Faker data
  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      setSeedStatus('Creating sample data...');
      
      // Generate random data using our Faker utility
      await generateFakerData({
        productsCount: 25,
        ordersCount: 30,
        activitiesCount: 20,
        clearExisting: true
      });
      
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
        <div className="min-h-screen dark:bg-gray-900 dark:text-white">
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={
                  <Layout>
                    <EnhancedDashboard />
                  </Layout>
                } />
                <Route path="/login" element={
                  <Layout>
                    <Login />
                  </Layout>
                } />
                <Route path="/inventory" element={
                  <Layout>
                    <Inventory />
                  </Layout>
                } />
                <Route path="/orders" element={
                  <Layout>
                    <Orders />
                  </Layout>
                } />
                <Route path="/create-order" element={
                  <Layout>
                    <CreateOrder />
                  </Layout>
                } />
              </Routes>
            </Suspense>
          </Router>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default EnhancedApp;