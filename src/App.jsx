// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login'; // Make sure this component exists
import Dashboard from './pages/Dashboard'; // Make sure this component exists
import Layout from './components/Layout'; // Make sure this component exists
import ProtectedRoute from './components/ProtectedRoute'; // Make sure this component exists

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        {/* Add a default route */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        {/* Add a catch-all route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;