// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CreateOrder from './pages/CreateOrder';
import Orders from './pages/Orders';
import Login from './pages/Login';
import BulkImportPage from './pages/BulkImportPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
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
          
          <Route path="/create-order" element={
            <ProtectedRoute>
              <Layout>
                <CreateOrder />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/bulk-import" element={
            <ProtectedRoute>
              <Layout>
                <BulkImportPage />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;