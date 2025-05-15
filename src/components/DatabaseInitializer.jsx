// src/components/DatabaseInitializer.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import seedDatabase, { createSampleDocument } from '../utils/seedDatabase';

const DatabaseInitializer = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setError(null);
    
    try {
      const results = await seedDatabase();
      setSeedResults(results);
    } catch (error) {
      console.error("Error in seed process:", error);
      setError(error.message || "Unknown error occurred");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateMinimumData = async () => {
    setIsSeeding(true);
    setError(null);
    
    try {
      // Create minimum required data for dashboard to display
      const results = {
        products: await createSampleDocument('products', {
          name: "Sample Product",
          stock: 20,
          price: 29.99
        }),
        
        orders: await createSampleDocument('orders', {
          customerName: "Sample Customer",
          itemCount: 1,
          total: 29.99,
          status: "pending"
        }),
        
        activities: await createSampleDocument('activities', {
          type: "system",
          description: "Dashboard initialized"
        })
      };
      
      setSeedResults(results);
    } catch (error) {
      console.error("Error creating minimum data:", error);
      setError(error.message || "Unknown error occurred");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Database Initializer</h1>
        
        <div className="mb-6">
          <p className="text-gray-600">
            Your dashboard is crashing because it requires specific data in your Firebase database.
            You have two options:
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Full database seed */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="text-xl font-bold text-indigo-700 mb-3">Option 1: Seed Complete Dataset</h3>
              <p className="text-gray-600 mb-4">
                This will add a complete set of sample data to your Firebase database, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 ml-2">
                <li>6 sample products with full details</li>
                <li>3 sample orders with customer information</li>
                <li>5 activity records for system tracking</li>
              </ul>
              <p className="text-sm text-gray-500 mb-4">
                Perfect for testing the full functionality of your dashboard.
              </p>
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {isSeeding ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Seeding Database...
                  </>
                ) : "Seed Database with Complete Dataset"}
              </button>
            </div>
            
            {/* Option 2: Minimum data */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-teal-50">
              <h3 className="text-xl font-bold text-teal-700 mb-3">Option 2: Add Minimum Data</h3>
              <p className="text-gray-600 mb-4">
                This will add just the minimum data needed for your dashboard to display without crashing:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 ml-2">
                <li>1 sample product with basic fields</li>
                <li>1 sample order with minimal information</li>
                <li>1 activity record for the system</li>
              </ul>
              <p className="text-sm text-gray-500 mb-4">
                Quick solution to get your dashboard working, but with minimal data to display.
              </p>
              <button
                onClick={handleCreateMinimumData}
                disabled={isSeeding}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300"
              >
                {isSeeding ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Minimum Data...
                  </>
                ) : "Add Minimum Required Data"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Results */}
        {seedResults && (
          <div className={`mt-8 p-4 rounded-lg ${
            error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <h3 className={`text-lg font-semibold ${
              error ? 'text-red-700' : 'text-green-700'
            } mb-2`}>
              {error ? 'Error' : 'Database Initialization Results'}
            </h3>
            
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    seedResults.products?.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-gray-700">Products: </span>
                  <span className="ml-2 text-sm font-medium">
                    {seedResults.products?.success 
                      ? `Success (${seedResults.products?.count || '1'} added)` 
                      : `Failed - ${seedResults.products?.error || 'Unknown error'}`}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    seedResults.orders?.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-gray-700">Orders: </span>
                  <span className="ml-2 text-sm font-medium">
                    {seedResults.orders?.success 
                      ? `Success (${seedResults.orders?.count || '1'} added)` 
                      : `Failed - ${seedResults.orders?.error || 'Unknown error'}`}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    seedResults.activities?.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-gray-700">Activities: </span>
                  <span className="ml-2 text-sm font-medium">
                    {seedResults.activities?.success 
                      ? `Success (${seedResults.activities?.count || '1'} added)` 
                      : `Failed - ${seedResults.activities?.error || 'Unknown error'}`}
                  </span>
                </div>
                
                <div className="pt-4 mt-4 border-t border-green-200">
                  <p className="text-green-700 font-medium">
                    Your dashboard should now work! You can try accessing it from the Dashboard link.
                  </p>
                  <div className="mt-4 flex space-x-4">
                    <Link 
                      to="/dashboard" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Go to Dashboard
                    </Link>
                    <Link 
                      to="/diagnostic" 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Run Database Diagnostic
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Manual Fix Instructions */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Manual Setup Instructions</h3>
          <p className="text-gray-600 mb-4">
            If you prefer to set up your database manually, you need to create these collections and documents:
          </p>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">products collection</h4>
              <p className="text-sm text-gray-600 mb-2">Each document needs at least:</p>
              <pre className="bg-white p-3 rounded border border-gray-200 text-xs overflow-x-auto">
{`{
  "name": "Product Name",
  "stock": 15,
  "price": 19.99
}`}
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">orders collection</h4>
              <p className="text-sm text-gray-600 mb-2">Each document needs at least:</p>
              <pre className="bg-white p-3 rounded border border-gray-200 text-xs overflow-x-auto">
{`{
  "customerName": "Customer Name",
  "createdAt": serverTimestamp(),
  "itemCount": 3,
  "total": 59.97,
  "status": "pending"
}`}
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">activities collection</h4>
              <p className="text-sm text-gray-600 mb-2">Each document needs at least:</p>
              <pre className="bg-white p-3 rounded border border-gray-200 text-xs overflow-x-auto">
{`{
  "type": "order",
  "description": "Activity description",
  "createdAt": serverTimestamp()
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInitializer;