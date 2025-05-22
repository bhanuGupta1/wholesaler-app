// src/components/dashboard/ProductGallery.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion } from 'framer-motion';

const ProductGallery = ({ darkMode, limit: displayLimit = 6 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Create a products query
        const productsRef = collection(db, 'products');
        let productsQuery;
        
        if (activeCategory === 'all') {
          productsQuery = query(
            productsRef,
            orderBy('createdAt', 'desc'),
            limit(displayLimit * 2) // Fetch more than needed to allow for filtering
          );
        } else {
          productsQuery = query(
            productsRef,
            where('category', '==', activeCategory),
            orderBy('createdAt', 'desc'),
            limit(displayLimit * 2)
          );
        }
        
        const productsSnapshot = await getDocs(productsQuery);
        
        // Process products
        const fetchedProducts = [];
        const categorySet = new Set(['all']);
        
        productsSnapshot.docs.forEach(doc => {
          const productData = doc.data();
          fetchedProducts.push({
            id: doc.id,
            ...productData
          });
          
          // Collect categories for filter
          if (productData.category) {
            categorySet.add(productData.category);
          }
        });
        
        // Update state
        setProducts(fetchedProducts.slice(0, displayLimit));
        setCategories(Array.from(categorySet));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [activeCategory, displayLimit]);

  return (
    <motion.div 
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Product Gallery</h2>
        
        {/* Category filter */}
        <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                activeCategory === category
                  ? darkMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-100 text-indigo-800'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Products' : category}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.length > 0 ? (
              products.map((product) => (
                <motion.div
                  key={product.id}
                  className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} hover:shadow-md transition-all duration-200`}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Link to={`/inventory/${product.id}`} className="block h-full">
                    <div className="h-40 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg 
                            className={`h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'} line-clamp-1`}>
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center mt-2">
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {product.category || 'Uncategorized'}
                        </div>
                        <div className={`text-sm font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          ${parseFloat(product.price).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Stock: {product.stock}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${product.stock <= 5 
                              ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                              : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                            }`}
                        >
                          {product.stock <= 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className={`col-span-full text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium">No products found</h3>
                {activeCategory !== 'all' ? (
                  <p className="mt-1 text-sm">
                    No products found in the {activeCategory} category.
                    <button 
                      onClick={() => setActiveCategory('all')} 
                      className={`ml-1 font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                    >
                      View all products
                    </button>
                  </p>
                ) : (
                  <p className="mt-1 text-sm">
                    Add products to your inventory to see them here.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
            <Link 
              to="/inventory" 
              className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}
            >
              View all products
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ProductGallery;