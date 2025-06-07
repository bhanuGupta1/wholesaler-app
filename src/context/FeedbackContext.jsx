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