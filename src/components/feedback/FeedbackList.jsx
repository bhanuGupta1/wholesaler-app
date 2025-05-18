// src/components/feedback/FeedbackList.jsx
import { useState } from 'react';
import { useFeedback } from '../../hooks/useFeedback';
import FeedbackItem from './FeedbackItem';

const FeedbackList = () => {
  const { feedback, loading, error } = useFeedback();
  const [sortOption, setSortOption] = useState('newest');
  const [filterOption, setFilterOption] = useState('all');
  
  // Sort and filter feedback
  const getSortedAndFilteredFeedback = () => {
    let result = [...feedback];
    
    // Apply filtering
    if (filterOption === 'high-rating') {
      result = result.filter(item => item.rating >= 4);
    } else if (filterOption === 'low-rating') {
      result = result.filter(item => item.rating <= 2);
    } else if (filterOption === 'with-replies') {
      result = result.filter(item => item.adminReply);
    } else if (filterOption === 'without-replies') {
      result = result.filter(item => !item.adminReply);
    }
    
    // Apply sorting
    if (sortOption === 'newest') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB - dateA;
      });
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateA - dateB;
      });
    } else if (sortOption === 'highest-rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'lowest-rating') {
      result.sort((a, b) => a.rating - b.rating);
    }
    
    return result;
  };
  
  const sortedFilteredFeedback = getSortedAndFilteredFeedback();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
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
    );
  }
  
  if (feedback.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Be the first to share your experience!
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {sortedFilteredFeedback.length} {sortedFilteredFeedback.length === 1 ? 'Review' : 'Reviews'}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Feedback</option>
            <option value="high-rating">High Ratings (4-5)</option>
            <option value="low-rating">Low Ratings (1-2)</option>
            <option value="with-replies">With Replies</option>
            <option value="without-replies">Without Replies</option>
          </select>
          
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest-rating">Highest Rating</option>
            <option value="lowest-rating">Lowest Rating</option>
          </select>
        </div>
      </div>
      
      {/* Feedback List */}
      <div className="space-y-4">
        {sortedFilteredFeedback.map(item => (
          <FeedbackItem key={item.id} feedback={item} />
        ))}
      </div>
      
      {/* No matching results message */}
      {sortedFilteredFeedback.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <h3 className="text-sm font-medium text-gray-900">No matching feedback</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try changing your filter options.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;