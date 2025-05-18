// src/pages/Feedback.jsx - Updated
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import FeedbackForm from '../components/feedback/FeedbackForm';

const Feedback = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Customer Feedback</h1>
      <p className="text-gray-600 mb-6">
        We value your opinions! Please share your experience with our products and services.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <FeedbackForm />
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h3 className="font-bold text-lg text-indigo-800 mb-3">Why Your Feedback Matters</h3>
          <p className="text-indigo-700 mb-4">
            Your honest feedback helps us improve our products and services. We use your input to:
          </p>
          <ul className="space-y-2 text-indigo-700">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Develop better products</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Enhance customer experience</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Train our team members</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Feedback;