import React, { useState } from 'react';

const FeedbackForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim whitespace to prevent empty inputs
    if (!name.trim() || !email.trim() || !message.trim() || rating === 0) {
      alert('Please fill all fields and give a rating.');
      return;
    }

    try {
      await onSubmit({ name: name.trim(), email: email.trim(), rating, message: message.trim() });
      setSubmitted(true);

      // Reset form
      setName('');
      setEmail('');
      setRating(0);
      setMessage('');
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded-lg">
        Thank you for your feedback! We appreciate your input.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <div className="flex space-x-2 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`h-8 w-8 rounded-full ${rating >= star ? 'bg-yellow-400' : 'bg-gray-200'}`}
            >
              {star}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          required
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;
