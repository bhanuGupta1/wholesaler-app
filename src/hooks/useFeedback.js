// src/hooks/useFeedback.js
import { useContext } from 'react';
import { FeedbackContext } from '../context/FeedbackContext';

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  
  if (context === null) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  
  return context;
};