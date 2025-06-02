import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
const BusinessRating = ({ businessId }) => {
  const { darkMode } = useTheme();
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        setLoading(true);
        
        // Get all feedback for this business
        const feedbackRef = collection(db, 'businesses', businessId, 'feedback');
        const snapshot = await getDocs(feedbackRef);
        
        if (snapshot.empty) {
          setRatingData({
            averageRating: 0,
            totalReviews: 0,
            ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          });
          return;
        }
        let totalRating = 0;
        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        snapshot.forEach(doc => {
          const feedback = doc.data();
          totalRating += feedback.rating;
          ratingCounts[feedback.rating]++;
        });
        
        setRatingData({
          averageRating: (totalRating / snapshot.size).toFixed(1),
          totalReviews: snapshot.size,
          ratingCounts
        });
      } catch (err) {
        console.error('Error fetching rating data:', err);
        setError('Failed to load rating data');
      } finally {
        setLoading(false);
      }
    };
 fetchRatingData();
  }, [businessId]);

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