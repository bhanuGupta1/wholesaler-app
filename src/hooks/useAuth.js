// src/hooks/useAuth.js - Custom hook to access authentication context
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};

// Also export as default for flexibility
export default useAuth;