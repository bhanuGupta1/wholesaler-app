import React from 'react';

// Documentation Component - Provides guides and resources for the WholesaleHub platform
const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          
          {/* Here I add the page title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Documentation</h1>
          
          <div className="prose prose-lg max-w-none">
            {/* Here I add an introduction to explain the purpose of the documentation */}
            <p className="text-gray-600 mb-8">
              Welcome to the WholesaleHub documentation. Here you'll find guides and 
              resources to help you make the most of our wholesale marketplace platform.
            </p>
            
            {/* Here I add the Getting Started section to introduce users to the platform */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
            
            {/* Here I add the account creation guide */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">1. Create Your Account</h3>
              <p className="text-gray-600">
                Sign up for a free account to access our wholesale marketplace. 
                Provide your business information for verification.
              </p>
            </div>
            
            {/* Here I add the product browsing guide */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">2. Browse Products</h3>
              <p className="text-gray-600">
                Use our search and filter tools to find products from verified suppliers. 
                Compare prices, minimum orders, and supplier ratings.
              </p>
            </div>
            
            {/* Here I add the order placement guide */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">3. Place Orders</h3>
              <p className="text-gray-600">
                Contact suppliers directly through our platform or place orders 
                using our secure checkout system.
              </p>
            </div>
            
            {/* Here I add the Key Features section to highlight platform capabilities */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Features</h2>
            <ul className="text-gray-600 mb-6 space-y-3">
              <li><strong>Product Search:</strong> Advanced search with filters for category, price, location, and more</li>
              <li><strong>Supplier Profiles:</strong> Detailed supplier information including ratings and reviews</li>
              <li><strong>Bulk Ordering:</strong> Streamlined process for large quantity purchases</li>
              <li><strong>Order Tracking:</strong> Real-time updates on your order status and shipping</li>
              <li><strong>Payment Protection:</strong> Secure payment processing with buyer protection</li>
            </ul>
            
            {/* Here I add the FAQ section to answer common user questions */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {/* Here I add a question about minimum order quantity */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">What is the minimum order quantity?</h3>
                <p className="text-gray-600">
                  Minimum order quantities vary by supplier and product. Check the 
                  product listing for specific MOQ requirements.
                </p>
              </div>
              
              {/* Here I add a question about becoming a verified supplier */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">How do I become a verified supplier?</h3>
                <p className="text-gray-600">
                  Contact our supplier relations team to begin the verification process. 
                  We'll review your business credentials and product quality.
                </p>
              </div>
              
              {/* Here I add a question about accepted payment methods */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept major credit cards, bank transfers, and trade financing 
                  options for qualified buyers.
                </p>
              </div>
            </div>
            
            {/* Here I add the support section for users needing assistance */}
            <div className="mt-8 p-6 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
              <p className="text-gray-600">
                Can't find what you're looking for? Contact our support team at 
                support@wholesalehub.com or call +1 (555) 123-4567.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
