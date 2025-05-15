// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { 
  subscribeToAuthChanges, 
  getAuthErrorMessage, 
  signInWithEmail,
  registerWithEmailAndPassword,
  logOut,
  resetPassword
} from "../firebase/authService";

// Create the AuthContext
export const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to auth state changes when the component mounts
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Register a new user
  const register = async (email, password, displayName) => {
    setError(null);
    try {
      await registerWithEmailAndPassword(email, password, displayName);
    } catch (error) {
      setError(getAuthErrorMessage(error));
      throw error;
    }
  };

  // Sign in a user
  const login = async (email, password) => {
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      setError(getAuthErrorMessage(error));
      throw error;
    }
  };

  // Sign out the current user
  const logout = async () => {
    setError(null);
    try {
      await logOut();
    } catch (error) {
      setError(getAuthErrorMessage(error));
      throw error;
    }
  };

  // Send password reset email
  const forgotPassword = async (email) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (error) {
      setError(getAuthErrorMessage(error));
      throw error;
    }
  };

  // Clear any authentication errors
  const clearError = () => setError(null);

  // The value to be provided to consumers of this context
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};