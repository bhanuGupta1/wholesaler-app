// src/App.jsx - Updated with additional inventory routes
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import ProductDetails from './components/inventory/ProductDetails';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';

function App() {
  return (
    <AuthProvider>
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
          <Route path="/inventory/:id" element={
            <Layout>
              <ProductDetails />
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
    </AuthProvider>
  );
}

export default App;