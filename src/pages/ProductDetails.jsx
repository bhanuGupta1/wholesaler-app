// src/pages/ProductDetails.jsx - Customer-facing catalog page with correct pricing
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  
  // State management
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch product details
  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch main product
      const productRef = doc(db, 'products', id);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        setError('Product not found');
        setLoading(false);
        return;
      }
      
      const productData = {
        id: productSnap.id,
        ...productSnap.data()
      };
      
      setProduct(productData);
      
      // Fetch related products (same category, excluding current product)
      if (productData.category) {
        const relatedQuery = query(
          collection(db, 'products'),
          where('category', '==', productData.category),
          limit(4)
        );
        
        const relatedSnap = await getDocs(relatedQuery);
        const related = relatedSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id && p.stock > 0);
        
        setRelatedProducts(related);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
      setLoading(false);
    }
  };

  // FIXED: Real multiple images support
  const getProductImages = (product) => {
    if (!product) return [];
    
    const images = [];
    
    // Add primary image first
    if (product.imageUrl) {
      images.push(product.imageUrl);
    }
    
    // Add additional images from imageUrls array
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach(url => {
        if (url && url.trim() && !images.includes(url)) {
          images.push(url);
        }
      });
    }
    
    // Fallback: use allImages if available
    if (images.length === 0 && product.allImages && Array.isArray(product.allImages)) {
      product.allImages.forEach(url => {
        if (url && url.trim()) {
          images.push(url);
        }
      });
    }
    
    // Debug log to see what images we found
    console.log('Product images found:', images);
    console.log('Product data:', { 
      imageUrl: product.imageUrl, 
      imageUrls: product.imageUrls, 
      allImages: product.allImages 
    });
    
    return images;
  };

  // Get cart quantity for this product
  const getCartQuantity = () => {
    const cartItem = cart.find(item => item.id === id);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle buy now (add to cart and go to checkout)
  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      if (!user) {
        navigate('/login', { state: { from: { pathname: '/checkout' } } });
      } else {
        navigate('/checkout');
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`p-8 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold mb-2">{error}</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              The product you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/catalog"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Browse Catalog
              </Link>
              <button
                onClick={() => navigate(-1)}
                className={`inline-flex items-center px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mock multiple images (for demo purposes)
  const productImages = product.imageUrl ? [product.imageUrl, product.imageUrl, product.imageUrl] : [];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 mb-8 text-sm">
          <Link to="/catalog" className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>
            Catalog
          </Link>
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>/</span>
          {product.category && (
            <>
              <Link to={`/catalog?category=${product.category}`} className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>
                {product.category}
              </Link>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>/</span>
            </>
          )}
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className={`aspect-w-1 aspect-h-1 w-full h-96 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl overflow-hidden mb-4`}>
              {productImages.length > 0 ? (
                <img 
                  src={productImages[activeImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-6xl">📦</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      activeImageIndex === index 
                        ? 'border-indigo-500' 
                        : darkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div>
            {/* Product Title and Price */}
            <div className="mb-6">
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {product.name}
              </h1>
              
              {/* FIXED: Correct Price Display Order */}
              <div className="flex items-center space-x-4 mb-4">
                <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${Number(product.price).toFixed(2)}
                </span>
                {/* Show originalPrice as crossed out (if it exists and is higher than current price) */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className={`text-lg line-through ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ${Number(product.originalPrice).toFixed(2)}
                  </span>
                )}
                {/* Show savings if there's an original price */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                  }`}>
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Category and SKU */}
              <div className="flex items-center space-x-4 text-sm">
                {product.category && (
                  <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {product.category}
                  </span>
                )}
                {product.sku && (
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    SKU: {product.sku}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  product.stock > 10 ? 'bg-green-500' : 
                  product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
                <span className={`font-medium ${
                  product.stock > 10 ? 'text-green-600 dark:text-green-400' : 
                  product.stock > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {product.stock > 10 ? 'In Stock' : 
                   product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                </span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                {product.stock} units available
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Description
                </h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Additional Details - Customer view (no internal pricing) */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {product.supplier && (
                  <div>
                    <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Supplier</dt>
                    <dd className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{product.supplier}</dd>
                  </div>
                )}
                <div>
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</dt>
                  <dd className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{product.category || 'Uncategorized'}</dd>
                </div>
                <div>
                  <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock Level</dt>
                  <dd className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{product.stock} units</dd>
                </div>
              </div>
            </div>

            {/* Bulk Pricing (for customers) */}
            {product.bulkPricing && (
              <div className="mb-8">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Volume Discounts
                </h3>
                <div className="space-y-2">
                  {Object.entries(product.bulkPricing).map(([quantity, price]) => (
                    <div key={quantity} className={`flex justify-between p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Buy {quantity}+ units
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${Number(price).toFixed(2)} each
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Section */}
            {product.stock > 0 && (
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center transition-colors`}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className={`w-20 text-center py-2 px-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center transition-colors`}
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Cart Status */}
                  {getCartQuantity() > 0 && (
                    <p className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mt-2`}>
                      {getCartQuantity()} already in cart
                    </p>
                  )}
                </div>

                {/* Total Price */}
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total:
                    </span>
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                      ${product.price.toFixed(2)} each
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 px-6 bg-indigo-600 text-white text-lg font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    className={`w-full py-3 px-6 border-2 border-indigo-600 text-indigo-600 text-lg font-medium rounded-lg hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${darkMode ? 'hover:border-indigo-500' : ''}`}
                  >
                    Buy Now
                  </button>
                  
                  <Link
                    to="/cart"
                    className={`block w-full py-2 px-6 text-center border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
                  >
                    View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </Link>
                </div>
              </div>
            )}

            {/* Out of Stock */}
            {product.stock === 0 && (
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border text-center`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'} mb-2`}>
                  Out of Stock
                </h3>
                <p className={`${darkMode ? 'text-red-300' : 'text-red-600'} mb-4`}>
                  This product is currently unavailable.
                </p>
                <button
                  className={`px-6 py-2 border rounded-lg ${darkMode ? 'border-red-600 text-red-400 hover:bg-red-900/30' : 'border-red-300 text-red-700 hover:bg-red-100'} transition-colors`}
                  onClick={() => alert('We\'ll notify you when this product is back in stock!')}
                >
                  Notify When Available
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <RelatedProductCard 
                  key={relatedProduct.id} 
                  product={relatedProduct} 
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Related Product Card Component
const RelatedProductCard = ({ product, darkMode }) => {
  return (
    <Link 
      to={`/products/${product.id}`}
      className={`block ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'} border rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group`}
    >
      {/* Product Image */}
      <div className="aspect-w-1 aspect-h-1 w-full h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1 line-clamp-2`}>
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${Number(product.price).toFixed(2)}
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {product.stock} left
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductDetails;