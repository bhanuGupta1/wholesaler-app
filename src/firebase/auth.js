// Import Firebase Authentication and Firestore methods
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

import { auth, db } from './config'; // Firebase initialized config

// -------------------------
// Sign in a user
// -------------------------
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// -------------------------
// Register a new user and store additional data in Firestore
// -------------------------
export const registerUser = async (email, password, userData = {}) => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name in the user's Firebase profile
    if (userData.displayName) {
      await updateProfile(user, {
        displayName: userData.displayName
      });
    }
    
    // Store user data in Firestore under 'users/{uid}'
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: userData.displayName || null,
      role: userData.role || 'user', // Default role is 'user'
      createdAt: new Date()
    });
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// -------------------------
// Log out the current
