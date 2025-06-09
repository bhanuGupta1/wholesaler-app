// PrivacyPolicy.jsx
import React from 'react';

// PrivacyPolicy Component - Displays the company's privacy policy
const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            {/* Last Updated Date - Automatically Updates */}
            <p className="text-sm text-gray-500 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            {/* Information We Collect Section */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
            <p className="text-gray-600 mb-6">
              We collect information you provide directly to us, such as when you create 
              an account, make a purchase, or contact us for support. This may include 
              your name, email address, phone number, billing information, and business details.
            </p>
            
            {/* How We Use Your Information */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• To provide and maintain our wholesale marketplace services</li>
              <li>• To process transactions and send related information</li>
              <li>• To send you technical notices and support messages</li>
              <li>• To communicate about products, services, and promotional offers</li>
              <li>• To improve our platform and develop new features</li>
            </ul>
            
            {/* Information Sharing Policy */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to 
              third parties without your consent, except as described in this policy. 
              We may share information with trusted partners who assist us in operating 
              our platform and serving our users.
            </p>
            
            {/* Data Security Measures */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
            <p className="text-gray-600 mb-6">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the internet is 100% secure.
            </p>
            
            {/* Contact Section */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at 
              privacy@wholesalehub.com or through our contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
