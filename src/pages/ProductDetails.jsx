// src/pages/ProductDetails.jsx - FIXED: Real multiple images support
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { 
  Heart, Share2, Eye, ShoppingCart, Star, Truck, Shield, RefreshCw, 
  ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Move, Play, Pause,
  RotateCw, Maximize2, Volume2, VolumeX, Camera, Video
} from 'lucide-react';

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
  // Enhanced zoom and magnifier states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [magnifierOffset, setMagnifierOffset] = useState({ x: 0, y: 0 });
  
  // 360° rotation states
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotation360, setRotation360] = useState(0);
  const [isDragging360, setIsDragging360] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  
  // Video states
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  
  // Bulk pricing states
  const [currentBulkPrice, setCurrentBulkPrice] = useState(null);
  const [bulkDiscount, setBulkDiscount] = useState(0);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const magnifierRef = useRef(null);
  const videoRef = useRef(null);

  ];

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

  const productImages = getProductImages(product);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
      // Show success message or redirect
      alert(`Added ${quantity} ${product.name}(s) to cart!`);
    }
  };

  const handleQuantityChange = (value) => {
    if (value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
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
                  onError={(e) => {
                    console.error('Failed to load image:', productImages[activeImageIndex]);
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="200" y="200" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="48">📦</text></svg>';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-6xl">📦</span>
                    <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No product image available
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images - Only show if more than 1 image */}
            {productImages.length > 1 && (
              <div>
                <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📸 More Images ({productImages.length})
                </p>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === index 
                          ? 'border-indigo-500 shadow-lg' 
                          : darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23f3f4f6"/><text x="40" y="40" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="24">❌</text></svg>';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Counter */}
            {productImages.length > 0 && (
              <div className={`mt-3 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Image {activeImageIndex + 1} of {productImages.length}
                {productImages.length === 1 && (
                  <span className="ml-2">• Single image</span>
                )}
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
              
              {/* SKU */}
              {product.sku && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                  SKU: {product.sku}
                </p>
              )}
              
              {/* Pricing with original price support */}
              <div className="flex items-center space-x-4 mb-4">
                <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${Number(product.price).toFixed(2)}
                </span>
                {/* Show original price as crossed out if it exists and is higher */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ${Number(product.originalPrice).toFixed(2)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    }`}>
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center space-x-4 mb-6">
                <div className={`flex items-center ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    product.stock > 10 ? 'bg-green-500' : 
                    product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                
                {/* Category badge */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Description */}
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

            {/* Supplier info */}
            {product.supplier && (
              <div className="mb-6">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sold by: <span className="font-medium">{product.supplier}</span>
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Pricing */}
            {product.bulkPricing && Object.keys(product.bulkPricing).length > 0 && (
              <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'} border`}>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
                  💰 Bulk Pricing Available
                </h4>
                <div className="space-y-1">
                  {Object.entries(product.bulkPricing).map(([qty, price]) => (
                    <div key={qty} className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                      {qty}+ units: ${Number(price).toFixed(2)} each
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Section */}
            {product.stock > 0 && (
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div>
                    <label htmlFor="quantity" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className={`px-3 py-2 border rounded-l-md ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' 
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                        } disabled:cursor-not-allowed`}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className={`w-20 px-3 py-2 border-t border-b text-center ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-gray-200' 
                            : 'border-gray-300 bg-white text-gray-900'
                        } focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className={`px-3 py-2 border rounded-r-md ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' 
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                        } disabled:cursor-not-allowed`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                      Total Price
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${(product.price * quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            )}

            {/* Out of Stock */}
            {product.stock === 0 && (
              <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} rounded-lg border p-6 text-center`}>
                <h3 className={`text-lg font-medium ${darkMode ? 'text-red-400' : 'text-red-800'} mb-2`}>
                  Out of Stock
                </h3>
                <p className={`${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  This product is currently unavailable. Check back later or contact the seller.
                </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} darkMode={darkMode} />
              ))}
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

// Related Product Card Component
const ProductCard = ({ product, darkMode }) => {
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