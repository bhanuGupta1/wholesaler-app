import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import FeedbackItem from './FeedbackItem';
import RatingForm from './RatingForm';

const FeedbackList = ({ productId }) => {
  const { darkMode } = useTheme();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const feedbackRef = collection(db, 'products', productId, 'feedback');
        const q = query(feedbackRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const feedbackData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setFeedback(feedbackData);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };
fetchFeedback();
  }, [productId]);

  const handleNewFeedback = (newFeedback) => {
    setFeedback(prev => [newFeedback, ...prev]);
    setShowForm(false);
  };
