// src/components/feedback/RatingAnalytics.jsx
import { useMemo } from 'react';
import StarRating from './StarRating';

const RatingAnalytics = ({ feedback }) => {
  // Calculate rating statistics
  const stats = useMemo(() => {
    if (!feedback || feedback.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        },
        percentages: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      };
    }
    
    // Count ratings in each category
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    let totalScore = 0;
    
    feedback.forEach(item => {
      const rating = item.rating || 0;
      if (rating >= 1 && rating <= 5) {
        distribution[rating] = (distribution[rating] || 0) + 1;
        totalScore += rating;
      }
    });
    
    const totalRatings = feedback.length;
    const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;
    
    // Calculate percentages
    const percentages = {};
    for (let i = 1; i <= 5; i++) {
      percentages[i] = totalRatings > 0 
        ? ((distribution[i] / totalRatings) * 100).toFixed(1) 
        : 0;
    }
    
    return {
      averageRating,
      totalRatings,
      distribution,
      percentages
    };
  }, [feedback]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Rating Display */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-indigo-600">
            {stats.averageRating.toFixed(1)}
          </span>
          <div className="my-2">
            <StarRating initialRating={Math.round(stats.averageRating)} readOnly={true} />
          </div>
          <span className="text-sm text-gray-500">
            Based on {stats.totalRatings} {stats.totalRatings === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        
        {/* Rating Distribution */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center">
              <div className="flex items-center w-12">
                <span className="text-sm font-medium text-gray-600">{rating}</span>
                <svg 
                  className="w-4 h-4 ml-1 text-yellow-500" 
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="w-full h-2 mx-4 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-indigo-600 rounded-full" 
                  style={{ width: `${stats.percentages[rating]}%` }}
                ></div>
              </div>
              <div className="w-12 text-xs font-medium text-gray-600">
                {stats.distribution[rating]} ({stats.percentages[rating]}%)
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Insights Section */}
      {stats.totalRatings > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Insights</h3>
          <div className="space-y-2">
            {stats.averageRating >= 4.5 && (
              <div className="flex items-start text-green-700">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Excellent ratings! Customers are very satisfied.</span>
              </div>
            )}
            {stats.averageRating >= 3.5 && stats.averageRating < 4.5 && (
              <div className="flex items-start text-blue-700">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Good overall satisfaction. Minor improvements could boost ratings.</span>
              </div>
            )}
            {stats.averageRating >= 2.5 && stats.averageRating < 3.5 && (
              <div className="flex items-start text-yellow-700">
                <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Mixed feedback. Consider addressing common complaints.</span>
              </div>
            )}
            {stats.averageRating < 2.5 && (
              <div className="flex items-start text-red-700">
                <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Significant concerns. Urgent improvements needed.</span>
              </div>
            )}
            {stats.distribution[5] > stats.distribution[4] && stats.distribution[5] > stats.distribution[3] && (
              <div className="flex items-start text-green-700">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Most customers give 5-star ratings. Keep up the good work!</span>
              </div>
            )}
            {stats.distribution[1] > 0 && stats.distribution[2] > 0 && (
              <div className="flex items-start text-yellow-700">
                <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span>There are some dissatisfied customers. Check low-rating feedback.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingAnalytics;