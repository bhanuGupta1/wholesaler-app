// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';

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
              <div className="p-4">
                <h1 className="text-2xl font-bold">Login Page</h1>
                <p>Login form will go here</p>
              </div>
            </Layout>
          } />
          <Route path="/inventory" element={
            <Layout>
              <div className="p-4">
                <h1 className="text-2xl font-bold">Inventory</h1>
                <p>Inventory management will go here (Sahib's responsibility)</p>
              </div>
            </Layout>
          } />
          <Route path="/orders" element={
            <Layout>
              <div className="p-4">
                <h1 className="text-2xl font-bold">Orders</h1>
                <p>Order management will go here (Paras's responsibility)</p>
              </div>
            </Layout>
          } />
          <Route path="/create-order" element={
            <Layout>
              <div className="p-4">
                <h1 className="text-2xl font-bold">Create Order</h1>
                <p>Order creation form will go here (Paras's responsibility)</p>
              </div>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;