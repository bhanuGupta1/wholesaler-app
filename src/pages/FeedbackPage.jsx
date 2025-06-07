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