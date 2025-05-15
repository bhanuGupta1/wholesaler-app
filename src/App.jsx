// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import { seedFirebaseData } from './utils/seedFirebase';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize app and seed data if needed
  useEffect(() => {
    async function init() {
      try {
        // Simply check Firebase connection without seeding
        console.log("Checking Firebase connection...");
        setIsInitializing(false);
      } catch (err) {
        console.error("Firebase initialization error:", err);
        setError(err.message);
        setIsInitializing(false);
      }
    }

    init();
  }, []);

  // Handle manual seed request
  const handleSeedData = async () => {
    try {
      setIsInitializing(true);
      await seedFirebaseData(true); // Force reseed
      window.location.reload(); // Reload after seeding
    } catch (error) {
      console.error('Error seeding data:', error);
      setError(error.message);
      setIsInitializing(false);
    }
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Initializing application...</p>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded shadow-md max-w-md">
          <h2 className="font-bold text-xl mb-2">Error Initializing Application</h2>
          <p className="mb-4">{error}</p>
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
          <div className="fixed bottom-4 right-4 z-50">
            <button 
              onClick={handleSeedData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-full shadow-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Test Data
            </button>
          </div>

          <Routes>
            <Route path="/" element={
              <Layout>
                <Dashboard />
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
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;