// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { 
  signIn, 
  registerUser, 
  logOut, 
  resetPassword, 
  getUserProfile,
  subscribeToAuthChanges,
  getAuthErrorMessage
} from '../firebase/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Fetch user profile if logged in
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId) => {
    try {
      const userData = await getUserProfile(userId);
      setUserProfile(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      await signIn(email, password);
      // User state will be updated by the auth state observer
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (email, password, userData) => {
    setError(null);
    try {
      await registerUser(email, password, userData);
      // User state will be updated by the auth state observer
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    setError(null);
    try {
      await logOut();
      // User state will be updated by the auth state observer
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Password reset function
  const sendPasswordReset = async (email) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
    sendPasswordReset
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;