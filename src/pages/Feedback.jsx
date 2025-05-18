// src/pages/Feedback.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import FeedbackForm from '../components/feedback/FeedbackForm';
import FeedbackList from '../components/feedback/FeedbackList';

const Feedback = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Customer Feedback</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            showForm 
              ? 'border-b-2 border-indigo-500 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setShowForm(true)}
        >
          Submit Feedback
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            !showForm 
              ? 'border-b-2 border-indigo-500 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setShowForm(false)}
        >
          View All Feedback
        </button>
      </div>

      {showForm ? (
        <>
          <p className="text-gray-600 mb-6">
            We value your opinions! Please share your experience with our products and services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <FeedbackForm onSuccess={() => setShowForm(false)} />
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
        </>
      ) : (
        <FeedbackList />
      )}
    </div>
  );
};

export default Feedback;
