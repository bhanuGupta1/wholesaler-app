// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    console.error("useAuth must be used within an AuthProvider");
    // Return a default value to prevent errors
    return { 
      user: null, 
      loading: false, 
      error: "Auth context not found", 
      login: () => {}, 
      logout: () => {} 
    };
  }
  
  return context;
};