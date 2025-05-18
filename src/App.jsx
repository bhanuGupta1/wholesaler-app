// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';

function App() {
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