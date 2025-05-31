// PrivacyPolicy.jsx
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
<p className="text-gray-600 mb-6">
  We collect information you provide directly to us, such as when you create an account, 
  make a purchase, or contact us for support.
</p>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
