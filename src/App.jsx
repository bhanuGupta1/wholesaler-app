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
  const [isSeeding, setIsSeeding] = useState(true);
  const [seedError, setSeedError] = useState(null);
  
  // Seed initial data when app starts
  useEffect(() => {
    async function initializeApp() {
      try {
        await seedFirebaseData();
        setIsSeeding(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setSeedError(error.message);
        setIsSeeding(false);
      }
    }

    initializeApp();
  }, []);

  // Show loading screen while seeding data
  if (isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Initializing application...</p>
      </div>
    );
  }

  // Show error screen if seeding failed
  if (seedError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md max-w-md">
          <p className="font-bold">Error Initializing Application</p>
          <p>{seedError}</p>
          <p className="mt-2 text-sm">
            Please check your Firebase configuration and make sure you have the proper permissions.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
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