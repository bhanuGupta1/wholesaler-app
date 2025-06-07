import React from 'react';
import { useEffect, useState } from "react";
import { useAuth } from '../hooks/useAuth';
import FeedbackList from '../components/feedback/FeedbackList';
const FeedbackPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  if (!user) {
    return <p className="p-6">Please log in to view or submit feedback.</p>;
  }

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The retry logic will be handled in the FeedbackList component
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Give Feedback</h1>
      <p className="text-gray-600 mb-6 dark:text-gray-400">
        We'd love to hear your thoughts about our service!
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-md dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            {error.message || "Failed to load feedback."}
          </p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
          >
            Try Again
          </button>
          <p className="mt-2 text-sm">
            Or contact us at{" "}
            <a href="mailto:support@wholesaler.com" className="text-blue-600 dark:text-blue-400">
              support@wholesaler.com
            </a>
          </p>
        </div>
      )}