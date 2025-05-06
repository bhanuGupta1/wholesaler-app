// src/context/AuthContext.jsx
import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Mock user state for development
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simplified mock auth functions
  const login = (email, password) => {
    console.log("Mock login with:", email, password);
    setUser({ email, displayName: "Test User" });
    return Promise.resolve();
  };

  const logout = () => {
    console.log("Mock logout");
    setUser(null);
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};