import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const RatingForm = ({ productId, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const feedbackRef = collection(db, 'products', productId, 'feedback');
      const newFeedback = {
        rating,
        comment,
        userId: user?.uid || null,
        userName: user?.displayName || 'Anonymous',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(feedbackRef, newFeedback);
      onSuccess({
        id: docRef.id,
        ...newFeedback,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
          {error}
        </div>
      )}