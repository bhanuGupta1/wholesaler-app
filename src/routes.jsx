import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import Layout from './components/common/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute>
            <Layout>
              <Inventory />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <Layout>
              <Orders />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-order" 
        element={
          <ProtectedRoute>
            <Layout>
              <CreateOrder />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <Layout>
            <Login />
          </Layout>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;