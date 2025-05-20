// src/pages/FeedbackAnalytics.jsx
import { useState, useEffect, useMemo } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { useAuth } from '../hooks/useAuth';
import RatingAnalytics from '../components/feedback/RatingAnalytics';

const FeedbackAnalytics = () => {
  const { user } = useAuth();
  const { feedback, loading, error } = useFeedback();
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Check if user has admin access
  const isAdmin = useMemo(() => {
    return user && (user.role === 'admin' || user.email === 'admin@example.com');
  }, [user]);
  
  // Filter feedback based on time
  const filteredFeedback = useMemo(() => {
    if (!feedback || feedback.length === 0) return [];
    
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;
    
    return feedback.filter(item => {
      if (timeFilter === 'all') return true;
      
      const createdAt = item.createdAt 
        ? (item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt)) 
        : new Date();
        
      const timeDiff = now - createdAt;
      
      if (timeFilter === 'day') return timeDiff <= oneDay;
      if (timeFilter === 'week') return timeDiff <= oneWeek;
      if (timeFilter === 'month') return timeDiff <= oneMonth;
      
      return true;
    });
  }, [feedback, timeFilter]);
  
  // Calculate sentiment distribution
  const sentimentStats = useMemo(() => {
    if (!filteredFeedback || filteredFeedback.length === 0) {
      return {
        positive: 0,
        neutral: 0,
        negative: 0,
        positivePercent: 0,
        neutralPercent: 0,
        negativePercent: 0
      };
    }
    
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    
    filteredFeedback.forEach(item => {
      const rating = item.rating || 0;
      
      if (rating >= 4) positive++;
      else if (rating >= 3) neutral++;
      else negative++;
    });
    
    const total = filteredFeedback.length;
    
    return {
      positive,
      neutral,
      negative,
      positivePercent: ((positive / total) * 100).toFixed(1),
      neutralPercent: ((neutral / total) * 100).toFixed(1),
      negativePercent: ((negative / total) * 100).toFixed(1)
    };
  }, [filteredFeedback]);
  
  // Calculate response rate
  const responseStats = useMemo(() => {
    if (!filteredFeedback || filteredFeedback.length === 0) {
      return {
        responded: 0,
        notResponded: 0,
        responseRate: 0
      };
    }
    
    const responded = filteredFeedback.filter(item => item.adminReply).length;
    const total = filteredFeedback.length;
    const notResponded = total - responded;
    
    return {
      responded,
      notResponded,
      responseRate: ((responded / total) * 100).toFixed(1)
    };
  }, [filteredFeedback]);
  
  // Unauthorized access
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">You don't have permission to access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Feedback Analytics</h1>
      
      {/* Time Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center">
          <span className="mr-3 text-sm font-medium text-gray-700">Time Period:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                timeFilter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                timeFilter === 'month' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                timeFilter === 'week' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeFilter('day')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                timeFilter === 'day' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 24 Hours
            </button>
          </div>
        </div>
      </div>
      
      {filteredFeedback.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback data for this period</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try selecting a different time period or collect more feedback.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating Analytics */}
          <div className="md:col-span-2">
            <RatingAnalytics feedback={filteredFeedback} />
          </div>
          
          {/* Sentiment Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sentiment Distribution</h2>
            
            <div className="space-y-4">
              {/* Positive */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Positive (4-5 stars)
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {sentimentStats.positive} ({sentimentStats.positivePercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${sentimentStats.positivePercent}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Neutral */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Neutral (3 stars)
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {sentimentStats.neutral} ({sentimentStats.neutralPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-yellow-500 rounded-full" 
                    style={{ width: `${sentimentStats.neutralPercent}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Negative */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Negative (1-2 stars)
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {sentimentStats.negative} ({sentimentStats.negativePercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-red-500 rounded-full" 
                    style={{ width: `${sentimentStats.negativePercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Feedback Insights */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sentiment Insights</h3>
              <div className="space-y-2">
                {sentimentStats.positivePercent >= 70 && (
                  <div className="flex items-start text-green-700">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Strong positive sentiment. Customers are very happy with your products/services.</span>
                  </div>
                )}
                {sentimentStats.negativePercent >= 30 && (
                  <div className="flex items-start text-red-700">
                    <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Significant negative sentiment. Review negative feedback for common issues.</span>
                  </div>
                )}
                {sentimentStats.neutralPercent >= 40 && (
                  <div className="flex items-start text-yellow-700">
                    <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>High neutral sentiment. Customers might be satisfied but not delighted.</span>
                  </div>
                )}
                {sentimentStats.positivePercent >= 50 && sentimentStats.negativePercent <= 20 && (
                  <div className="flex items-start text-green-700">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Healthy sentiment balance with more positive than negative feedback.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Response Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Rate</h2>
            
            <div className="flex flex-col items-center mb-6">
              <div className="relative h-36 w-36">
                <svg className="h-36 w-36" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="#edf2f7" 
                    strokeWidth="4" 
                  />
                  
                  {/* Progress circle */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="4" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - responseStats.responseRate} 
                    transform="rotate(-90 18 18)" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-indigo-600">{responseStats.responseRate}%</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">Response rate</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-4">
                <span className="block text-2xl font-bold text-green-600">{responseStats.responded}</span>
                <span className="text-sm text-green-700">Responded</span>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <span className="block text-2xl font-bold text-red-600">{responseStats.notResponded}</span>
                <span className="text-sm text-red-700">Not Responded</span>
              </div>
            </div>
            
            {/* Response Insights */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Response Insights</h3>
              <div className="space-y-2">
                {responseStats.responseRate >= 80 && (
                  <div className="flex items-start text-green-700">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Excellent response rate! Keep up the great customer engagement.</span>
                  </div>
                )}
                {responseStats.responseRate >= 50 && responseStats.responseRate < 80 && (
                  <div className="flex items-start text-blue-700">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Good response rate. Consider improving to address all customer feedback.</span>
                  </div>
                )}
                {responseStats.responseRate < 50 && (
                  <div className="flex items-start text-yellow-700">
                    <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Response rate needs improvement. Try to respond to more customer feedback.</span>
                  </div>
                )}
                {responseStats.notResponded > 0 && (
                  <div className="flex items-start text-blue-700">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You have {responseStats.notResponded} unanswered feedback items.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackAnalytics;