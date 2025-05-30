// src/context/AuthContext.jsx - Enhanced with approval system and better error handling
import { createContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [permissions, setPermissions] = useState({});

  // Initialize authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError(null);
      
      if (currentUser) {
        try {
          // Get additional user data from Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check approval status
            const isApprovalRequired = userData.requiresApproval || false;
            const isApproved = userData.approved || false;
            const accountStatus = userData.status || 'active';
            
            // Determine if user can access the system
            const canAccess = !isApprovalRequired || isApproved;
            
            if (canAccess) {
              // User can access - set full user data
              const fullUser = {
                ...currentUser,
                ...userData,
                canAccess: true
              };
              
              setUser(fullUser);
              setUserRole(userData.accountType || 'user');
              setApprovalStatus({
                required: isApprovalRequired,
                approved: isApproved,
                status: accountStatus,
                canAccess: true
              });
              setPermissions(userData.permissions || {});
              
              // Update last login
              await updateDoc(userRef, { 
                lastLogin: new Date(),
                isActive: true
              });
            } else {
              // User exists but not approved - limited access
              const limitedUser = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: userData.displayName,
                accountType: userData.accountType,
                status: accountStatus,
                canAccess: false,
                requiresApproval: true,
                approved: false
              };
              
              setUser(limitedUser);
              setUserRole('pending');
              setApprovalStatus({
                required: true,
                approved: false,
                status: accountStatus,
                canAccess: false,
                message: getApprovalMessage(accountStatus)
              });
              setPermissions({});
            }
          } else {
            // User exists in Auth but not in Firestore - create basic record
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email.split('@')[0],
              accountType: 'user',
              approved: true,
              status: 'active',
              requiresApproval: false,
              permissions: {
                canCreateOrders: true,
                canManageInventory: false,
                canViewAllOrders: false,
                canApproveUsers: false,
                canManageUsers: false
              },
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true
            });
            
            const basicUser = {
              ...currentUser,
              accountType: 'user',
              approved: true,
              canAccess: true
            };
            
            setUser(basicUser);
            setUserRole('user');
            setApprovalStatus({
              required: false,
              approved: true,
              status: 'active',
              canAccess: true
            });
            setPermissions({
              canCreateOrders: true,
              canManageInventory: false,
              canViewAllOrders: false,
              canApproveUsers: false,
              canManageUsers: false
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data");
          
          // Still set basic user info even if Firestore fetch fails
          setUser({
            ...currentUser,
            canAccess: true,
            accountType: 'user'
          });
          setUserRole('user');
          setApprovalStatus({
            required: false,
            approved: true,
            status: 'active',
            canAccess: true
          });
        }
      } else {
        // No user is signed in
        setUser(null);
        setUserRole('guest');
        setApprovalStatus(null);
        setPermissions({});
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Helper function to get approval message
  const getApprovalMessage = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'Your account is pending admin approval. You will receive an email notification once approved.';
      case 'rejected':
        return 'Your account application was rejected. Please contact support for more information.';
      case 'suspended':
        return 'Your account has been suspended. Please contact support for assistance.';
      default:
        return 'Your account requires approval before you can access the system.';
    }
  };

  // Login function with approval checking
  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Firebase will trigger onAuthStateChanged which will update the user state
      // and handle approval checking
      
      return userCredential.user;
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        default:
          errorMessage = err.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
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
        uid: userCredential.user.uid,
        email,
        displayName: displayName || email.split('@')[0],
        accountType: 'user',
        approved: true,
        status: 'active',
        requiresApproval: false,
        permissions: {
          canCreateOrders: true,
          canManageInventory: false,
          canViewAllOrders: false,
          canApproveUsers: false,
          canManageUsers: false
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      
      // Firebase will trigger onAuthStateChanged which will update the user state
      return userCredential.user;
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        default:
          errorMessage = err.message || 'Registration failed. Please try again.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
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
      let errorMessage = 'Failed to send password reset email.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        default:
          errorMessage = err.message || 'Failed to send password reset email.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return permissions[permission] === true;
  };

  // Check if user can access a feature based on role and permissions
  const canAccess = (requiredRole = null, requiredPermission = null) => {
    if (!user || !user.canAccess) return false;
    
    if (requiredRole && userRole !== requiredRole) return false;
    
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    
    return true;
  };

  // Refresh user data (useful after admin approval)
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedUser = {
          ...user,
          ...userData,
          canAccess: userData.approved || !userData.requiresApproval
        };
        
        setUser(updatedUser);
        setUserRole(userData.accountType || 'user');
        setApprovalStatus({
          required: userData.requiresApproval || false,
          approved: userData.approved || false,
          status: userData.status || 'active',
          canAccess: userData.approved || !userData.requiresApproval
        });
        setPermissions(userData.permissions || {});
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Provide auth context
  const value = {
    user,
    loading,
    error,
    userRole,
    approvalStatus,
    permissions,
    login,
    logout,
    register,
    resetPassword,
    hasPermission,
    canAccess,
    refreshUserData,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;