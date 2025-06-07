import React, { useEffect, useState } from 'react';

const FeedbackList = ({ orderId, onLoading, onError }) => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        if (onLoading) onLoading(true);
        
        const response = await fetch(`/api/feedback?orderId=${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to load feedback');
        }
        const data = await response.json();
        setFeedback(data);
        if (onError) onError(null);
      } catch (err) {
        console.error('Feedback loading error:', err);
        if (onError) onError(err);
      } finally {
        setIsLoading(false);
        if (onLoading) onLoading(false);
      }
    };

    fetchFeedback();
  }, [orderId, onLoading, onError]);

  if (isLoading) {
    return null; // Loading state is handled by parent
  }