// AboutUs.jsx
import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">About Us</h1>
          <p className="text-gray-600">
            Welcome to WholesaleHub, your trusted partner in wholesale commerce.
          </p>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
<p className="text-gray-600 mb-6">
  To simplify wholesale trading by providing a comprehensive platform that 
  enables businesses to discover, connect, and trade with confidence.
</p>
<h2 className="text-2xl font-semibold text-gray-800 mb-4">What We Offer</h2>
<ul className="text-gray-600 mb-6 space-y-2">
  <li>• Extensive product catalog from verified suppliers</li>
  <li>• Secure payment processing and transaction management</li>
  <li>• Quality assurance and supplier verification</li>
</ul>
<h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
<div className="text-gray-600">
  <p><strong>Email:</strong> info@wholesalehub.com</p>
  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
  <p><strong>Address:</strong> 123 Commerce Street, Business District, NY 10001</p>
</div>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;
