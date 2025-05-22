// src/context/AuthContext.jsx - Enhanced with better authentication
import { createContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('guest');

  // Initialize authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        try {
          // Get additional user data from Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            // Combine Firebase auth user with Firestore user data
            setUser({
              ...currentUser,
              ...userDoc.data()
            });
            setUserRole(userDoc.data().role || 'user');
          } else {
            // If Firestore record doesn't exist, create one
            await setDoc(userRef, {
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email.split('@')[0],
              role: 'user', // Default role
              createdAt: new Date()
            });
            
            setUser({
              ...currentUser,
              role: 'user',
              displayName: currentUser.displayName || currentUser.email.split('@')[0],
              createdAt: new Date()
            });
            setUserRole('user');
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          // Still set the basic user info even if Firestore fetch fails
          setUser(currentUser);
          setUserRole('user');
        }
      } else {
        // No user is signed in
        setUser(null);
        setUserRole('guest');
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set persistence based on rememberMe option
      // In a real app, you would use setPersistence, but for simplicity we'll skip that
      
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Firebase will trigger onAuthStateChanged which will update the user state
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, displayName) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName: displayName || email.split('@')[0],
        role: 'user',
        createdAt: new Date()
      });
      
      // Firebase will trigger onAuthStateChanged which will update the user state
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      // Firebase will trigger onAuthStateChanged which will update the user state
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context
  const value = {
    user,
    loading,
    error,
    userRole,
    login,
    logout,
    register,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;