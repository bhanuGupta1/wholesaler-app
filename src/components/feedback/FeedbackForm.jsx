import React, { useState } from 'react';

const FeedbackForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message || rating === 0) {
      alert('Please fill all fields and give a rating.');
      return;
    }
     try {
      await onSubmit({ name, email, rating, message });
      setSubmitted(true);
      // Reset form after successful submission
      setName('');
      setEmail('');
      setRating(0);
      setMessage('');
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    }
  };
 try {
      await onSubmit({ name, email, rating, message });
      setSubmitted(true);
      // Reset form after successful submission
      setName('');
      setEmail('');
      setRating(0);
      setMessage('');
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    }
  };