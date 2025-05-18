// src/pages/Feedback.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';



const Feedback = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Customer Feedback</h1>
      <p className="text-gray-600 mb-6">
        We value your opinions! Please share your experience with our products and services.
      </p>
      
      {/* Content will be added in next commits */}
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <p className="text-yellow-700">Feedback form coming soon!</p>
      </div>
    </div>
  );
}

export default Feedback;