import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

// Basic ProductCard Component
const ProductCard = ({ product, darkMode }) => (
  <div className={`border rounded-lg p-4 shadow ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
    <div className="h-32 bg-gray-100 flex items-center justify-center rounded mb-4 overflow-hidden">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-cover h-full w-full"
        />
      ) : (
        // SVG placeholder
        <svg width="40" height="40" fill={darkMode ? "#666" : "#ccc"} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="10">{product.name[0]}</text>
        </svg>
      )}
    </div>
    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
    <p className="text-sm mb-2">{product.description}</p>
    <span className="font-bold">${Number(product.price).toFixed(2)}</span>
  </div>
);

const GuestDashboard = () => {
  const { darkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsRef);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);

        const uniqueCategories = [...new Set(productsData.map(product => product.category))].filter(Boolean);
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-3xl font-bold mb-8">Welcome to Wholesaler</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} darkMode={darkMode} />
        ))}
      </div>
    </div>
  );
};

export default GuestDashboard;
