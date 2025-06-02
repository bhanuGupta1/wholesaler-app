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
if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Customer Feedback ({feedback.length})
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              darkMode 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {showForm ? 'Cancel' : 'Add Feedback'}
          </button>
        </div>
      </div>