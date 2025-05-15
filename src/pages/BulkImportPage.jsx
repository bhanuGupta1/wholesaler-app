// src/pages/BulkImportPage.jsx
import { useState } from 'react';
import { collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateProductImageUrl } from '../utils/imageUtils';
import sampleProducts from '../data/sampleProducts.json';

const BulkImportPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(sampleProducts, null, 2));
  
  const bulkImportProducts = async (products) => {
    try {
      const batch = writeBatch(db);
      
      // Process each product
      products.forEach((product) => {
        // Generate image URL if not provided
        if (!product.imageUrl) {
          product.imageUrl = generateProductImageUrl(product);
        }
        
        // Add timestamp fields
        const productWithMeta = {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Add to batch
        const newProductRef = doc(collection(db, 'products'));
        batch.set(newProductRef, productWithMeta);
      });
      
      // Commit the batch
      await batch.commit();
      return products.length;
    } catch (error) {
      console.error('Error bulk importing products:', error);
      throw error;
    }
  };
  
  const handleImport = async () => {
    try {
      setLoading(true);
      
      // Parse JSON input
      const products = JSON.parse(jsonInput);
      
      // Validate products array
      if (!Array.isArray(products)) {
        throw new Error('Input must be an array of products');
      }
      
      // Import products
      const count = await bulkImportProducts(products);
      
      setResult({
        success: true,
        message: `Successfully imported ${count} products`
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(sampleProducts, null, 2));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bulk Import Products</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <label className="block text-gray-700 font-medium">Products JSON:</label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Load Sample Data
            </button>
          </div>
          <textarea
            className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
        </div>
        
        <button
          type="button"
          onClick={handleImport}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {loading ? 'Importing...' : 'Import Products'}
        </button>
        
        {result && (
          <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p>{result.message}</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Instructions</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Paste a JSON array of products in the textarea above, or use the sample data.</li>
          <li>Each product should have: name, description, price, stockQuantity, category, and sku.</li>
          <li>Click the "Import Products" button to add the products to your database.</li>
          <li>The system will automatically generate image URLs for your products.</li>
        </ol>
      </div>
    </div>
  );
};

export default BulkImportPage;