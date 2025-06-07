import React from 'react';
import { useAuth } from '../hooks/useAuth';
import FeedbackList from '../components/feedback/FeedbackList';

const FeedbackPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <p className="p-6">Please log in to view or submit feedback.</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Give Feedback</h1>
      <p className="text-gray-600 mb-6 dark:text-gray-400">We’d love to hear your thoughts about our service!</p>
      {/* You can pass a placeholder orderId or userId-based identifier */}
      <FeedbackList orderId={`general-feedback-${user.uid}`} />
    </div>
  );
};

export default FeedbackPage;
