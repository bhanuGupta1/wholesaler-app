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
import Feedback from './pages/Feedback';
import ProductFeedback from './pages/ProductFeedback';


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
// Update src/routes.jsx
import Feedback from './pages/Feedback';

// ...existing routes...
<Route 
  path="/feedback" 
  element={
    <ProtectedRoute>
      <Layout>
        <Feedback />
      </Layout>
    </ProtectedRoute>
  } 
/>
// Update src/routes.jsx
import ProductFeedback from './pages/ProductFeedback';

// ...existing routes...
<Route 
  path="/products/:productId/feedback" 
  element={
    <ProtectedRoute>
      <Layout>
        <ProductFeedback />
      </Layout>
    </ProtectedRoute>
  } 
/>
// Update src/routes.jsx
import FeedbackAnalytics from './pages/FeedbackAnalytics';

// ...existing routes...
<Route 
  path="/feedback/analytics" 
  element={
    <ProtectedRoute>
      <Layout>
        <FeedbackAnalytics />
      </Layout>
    </ProtectedRoute>
  } 
/>

export default AppRoutes;