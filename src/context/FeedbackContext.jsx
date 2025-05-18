// src/context/FeedbackContext.jsx
import { createContext, useState, useEffect } from 'react';
import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, 
  where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const FeedbackContext = createContext(null);

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all feedback
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const feedbackRef = collection(db, 'feedback');
      const q = query(feedbackRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const feedbackData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFeedback(feedbackData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback. Please try again later.');
      setLoading(false);
    }
  };

  // Submit new feedback
  const addFeedback = async (feedbackData) => {
    try {
      const newFeedback = {
        ...feedbackData,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'feedback'), newFeedback);
      
      // Add local ID for immediate UI update
      const createdFeedback = {
        id: docRef.id,
        ...newFeedback,
        createdAt: new Date() // Local date before server timestamp is available
      };
      
      setFeedback(prev => [createdFeedback, ...prev]);
      
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error adding feedback:', err);
      setError('Failed to submit feedback. Please try again.');
      return { success: false, error: err.message };
    }
  };

  // Update feedback
  const updateFeedback = async (id, updatedData) => {
    try {
      const feedbackRef = doc(db, 'feedback', id);
      await updateDoc(feedbackRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      });
      
      setFeedback(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updatedData, updatedAt: new Date() } : item
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error updating feedback:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete feedback
  const deleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedback(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting feedback:', err);
      return { success: false, error: err.message };
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <FeedbackContext.Provider value={{
      feedback,
      loading,
      error,
      fetchFeedback,
      addFeedback,
      updateFeedback,
      deleteFeedback
    }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider;