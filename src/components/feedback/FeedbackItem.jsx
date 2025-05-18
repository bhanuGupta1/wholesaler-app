// src/components/feedback/FeedbackItem.jsx
import { useState } from 'react';
import StarRating from './StarRating';
import { useFeedback } from '../../hooks/useFeedback';
import { useAuth } from '../../hooks/useAuth';

const FeedbackItem = ({ feedback }) => {
  const { user } = useAuth();
  const { updateFeedback, deleteFeedback } = useFeedback();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState(feedback.adminReply || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format date string
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if user is admin - modify this based on your user roles system
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@example.com');
  
  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!reply.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const result = await updateFeedback(feedback.id, {
        adminReply: reply,
        adminReplyBy: user.displayName || user.email,
        repliedAt: new Date()
      });
      
      if (result.success) {
        setIsReplying(false);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle feedback deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      await deleteFeedback(feedback.id);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
              {feedback.userName ? feedback.userName.charAt(0) : 'A'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {feedback.userName || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(feedback.createdAt)}
              </p>
            </div>
          </div>
          <div>
            <StarRating initialRating={feedback.rating} readOnly={true} />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{feedback.title}</h3>
        <p className="text-gray-600 mb-4">
          {isExpanded 
            ? feedback.comment
            : feedback.comment.length > 150 
              ? `${feedback.comment.substring(0, 150)}...` 
              : feedback.comment
          }
        </p>
        
        {feedback.comment.length > 150 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
        
        {/* Admin Reply Section */}
        {feedback.adminReply && (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                A
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {feedback.adminReplyBy || 'Administrator'} <span className="text-xs font-normal text-gray-500">responded</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">{feedback.adminReply}</p>
                {feedback.repliedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(feedback.repliedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer - Only visible to admins */}
      {isAdmin && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          {isReplying ? (
            <div className="space-y-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Write your reply..."
                rows="3"
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1.5 border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={isSubmitting || !reply.trim()}
                  className="px-3 py-1.5 bg-indigo-600 text-sm rounded-md text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsReplying(true)}
                className="px-3 py-1.5 bg-indigo-600 text-sm rounded-md text-white hover:bg-indigo-700"
              >
                {feedback.adminReply ? 'Edit Reply' : 'Reply'}
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 text-sm rounded-md text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackItem;