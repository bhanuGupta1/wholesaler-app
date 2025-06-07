import React from 'react';
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
  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <div className="text-4xl font-bold text-indigo-600">
            {ratingData.averageRating}
          </div>
          <div className="flex justify-center md:justify-start mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                className={`h-5 w-5 ${star <= Math.round(ratingData.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {ratingData.totalReviews} reviews
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center mb-2">
              <div className="text-sm font-medium w-8">{star}</div>
              <div className="flex-1 mx-2">
                <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-2 rounded-full bg-yellow-400" 
                    style={{
                      width: `${(ratingData.ratingCounts[star] / ratingData.totalReviews) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className={`text-xs w-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {ratingData.ratingCounts[star]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessRating;