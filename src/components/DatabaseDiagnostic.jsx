// src/components/DatabaseDiagnostic.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const DatabaseDiagnostic = () => {
  const [diagnosticResults, setDiagnosticResults] = useState({
    loading: true,
    results: {},
    error: null
  });

  // List of collections the Dashboard expects
  const requiredCollections = [
    'products',
    'orders',
    'activities'
  ];

  // Expected fields for each document in collections
  const expectedFields = {
    products: ['id', 'name', 'stock', 'price'],
    orders: ['id', 'customerName', 'createdAt', 'itemCount', 'total', 'status'],
    activities: ['id', 'type', 'description', 'createdAt']
  };

  useEffect(() => {
    async function checkDatabase() {
      try {
        const results = {};
        
        // Check each collection
        for (const collectionName of requiredCollections) {
          try {
            console.log(`Checking collection: ${collectionName}`);
            const snapshot = await getDocs(collection(db, collectionName));
            const exists = !snapshot.empty;
            const count = snapshot.size;
            
            // Check document structure if collection exists
            let sampleDoc = null;
            let missingFields = [];
            
            if (exists && count > 0) {
              sampleDoc = snapshot.docs[0].data();
              const expectedForCollection = expectedFields[collectionName] || [];
              
              missingFields = expectedForCollection.filter(
                field => !sampleDoc.hasOwnProperty(field) && field !== 'id' // ID might be from doc.id
              );
            }
            
            results[collectionName] = {
              exists,
              count,
              sampleDoc,
              missingFields,
              isValid: exists && count > 0 && missingFields.length === 0
            };
          } catch (error) {
            console.error(`Error checking ${collectionName}:`, error);
            results[collectionName] = {
              exists: false,
              error: error.message,
              isValid: false
            };
          }
        }
        
        setDiagnosticResults({
          loading: false,
          results,
          error: null
        });
      } catch (error) {
        console.error("Database diagnostic error:", error);
        setDiagnosticResults({
          loading: false,
          results: {},
          error: error.message
        });
      }
    }
    
    checkDatabase();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Firebase Database Diagnostic</h1>
      
      {diagnosticResults.loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Scanning database collections...</p>
        </div>
      ) : diagnosticResults.error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Error scanning database: {diagnosticResults.error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard Requirements</h2>
            <p className="text-gray-600 mb-4">
              The dashboard requires these collections to function properly. Here's what we found in your Firebase database:
            </p>
            
            {Object.entries(diagnosticResults.results).map(([collection, info]) => (
              <div key={collection} className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Collection: <span className="font-mono">{collection}</span>
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    info.isValid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {info.isValid ? 'Valid' : 'Issue Detected'}
                  </span>
                </div>
                
                <div className="ml-6 space-y-2">
                  <p className={`text-sm ${info.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {info.exists 
                      ? `✓ Collection exists with ${info.count} document(s)` 
                      : `✕ Collection does not exist or is empty`}
                  </p>
                  
                  {info.exists && info.count > 0 && (
                    <>
                      {info.missingFields && info.missingFields.length > 0 ? (
                        <div className="text-sm text-red-600">
                          <p>✕ Missing required fields:</p>
                          <ul className="list-disc list-inside ml-4">
                            {info.missingFields.map(field => (
                              <li key={field}>{field}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-green-600">
                          ✓ Document structure looks good
                        </p>
                      )}
                      
                      <div className="mt-3">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                            View sample document structure
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 overflow-x-auto text-xs">
                            {JSON.stringify(info.sampleDoc, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">How to Fix</h2>
            
            <div className="space-y-4">
              {/* Products Collection */}
              {!diagnosticResults.results.products?.isValid && (
                <div className="border-l-4 border-blue-400 pl-4 py-2">
                  <h3 className="font-semibold text-blue-800">Products Collection</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a collection named 'products' with documents that have at least these fields:
                  </p>
                  <pre className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 overflow-x-auto text-xs">
{`{
  "name": "Product Name",
  "stock": 15,
  "price": 19.99
}`}
                  </pre>
                  <p className="text-sm text-gray-500 mt-2">
                    The 'stock' field is used to calculate low stock alerts, using a threshold of 10.
                  </p>
                </div>
              )}
              
              {/* Orders Collection */}
              {!diagnosticResults.results.orders?.isValid && (
                <div className="border-l-4 border-green-400 pl-4 py-2">
                  <h3 className="font-semibold text-green-800">Orders Collection</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a collection named 'orders' with documents that have at least these fields:
                  </p>
                  <pre className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 overflow-x-auto text-xs">
{`{
  "customerName": "Customer Name",
  "createdAt": Timestamp,
  "itemCount": 3,
  "total": 59.97,
  "status": "pending" // or "completed", "shipped", "cancelled"
}`}
                  </pre>
                  <p className="text-sm text-gray-500 mt-2">
                    The 'createdAt' field should be a Firebase Timestamp (using serverTimestamp() when creating).
                  </p>
                </div>
              )}
              
              {/* Activities Collection */}
              {!diagnosticResults.results.activities?.isValid && (
                <div className="border-l-4 border-purple-400 pl-4 py-2">
                  <h3 className="font-semibold text-purple-800">Activities Collection</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a collection named 'activities' with documents that have at least these fields:
                  </p>
                  <pre className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 overflow-x-auto text-xs">
{`{
  "type": "order", // or "inventory"
  "description": "New order placed by John Doe",
  "createdAt": Timestamp
}`}
                  </pre>
                  <p className="text-sm text-gray-500 mt-2">
                    Activities track user or system actions. The type field is used for icon display.
                  </p>
                </div>
              )}
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Temporary Solution
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  If you want to use the dashboard without adding data, you can modify the Dashboard component to not depend on these collections:
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 ml-4">
                  <li>Add default empty arrays and objects to prevent crashes</li>
                  <li>Use mock data instead of Firebase data</li>
                  <li>Comment out sections that require specific data</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
            <h2 className="text-xl font-bold text-indigo-800 mb-4">Need Data Samples?</h2>
            <p className="text-indigo-600 mb-4">
              Would you like me to generate sample data that you can use to populate your Firebase database?
            </p>
            <button className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={() => alert("This would generate sample data in a real app")}>
              Generate Sample Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDiagnostic;