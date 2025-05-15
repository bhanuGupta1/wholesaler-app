// src/components/Layout.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <h1>Wholesaler App</h1>
          {currentUser && (
            <div className="user-info">
              <span>{currentUser.email}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Wholesaler App</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;