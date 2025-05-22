// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAt2UcbVJaISAQ_RdFz94GjZKr3J8uDi1M",
  authDomain: "wholesaler-app-ac31b.firebaseapp.com",
  projectId: "wholesaler-app-ac31b",
  storageBucket: "wholesaler-app-ac31b.firebasestorage.app",
  messagingSenderId: "890188536922",
  appId: "1:890188536922:web:1c76630ad0009f3e820c63",
  measurementId: "G-B1283LT09L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;