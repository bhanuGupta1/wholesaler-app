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

  // Mock 360° images and video data (replace with real data)
  const mock360Images = [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop',
  ];

  const mockProductVideo = {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Sample video
    thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop'
  };

  // Fetch product details
  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Calculate bulk pricing whenever quantity changes
  useEffect(() => {
    if (product && product.bulkPricing) {
      calculateBulkPricing();
    }
  }, [quantity, product]);

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

  // Calculate bulk pricing based on quantity
  const calculateBulkPricing = () => {
    if (!product?.bulkPricing) {
      setCurrentBulkPrice(null);
      setBulkDiscount(0);
      return;
    }

    const bulkTiers = Object.keys(product.bulkPricing)
      .map(tier => parseInt(tier))
      .sort((a, b) => b - a); // Sort descending

    // Find the highest tier that applies
    const applicableTier = bulkTiers.find(tier => quantity >= tier);
    
    if (applicableTier) {
      const bulkPrice = product.bulkPricing[applicableTier.toString()];
      const savings = product.price - bulkPrice;
      const discountPercent = (savings / product.price) * 100;
      
      setCurrentBulkPrice(bulkPrice);
      setBulkDiscount(discountPercent);
    } else {
      setCurrentBulkPrice(null);
      setBulkDiscount(0);
    }
  };

  // Get effective price (bulk price if applicable, otherwise regular price)
  const getEffectivePrice = () => {
    return currentBulkPrice || product?.price || 0;
  };

  // Get product images
  const getProductImages = (product) => {
    if (!product) return [];
    
    const images = [];
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach(url => {
        if (url && url.trim() && !images.includes(url)) {
          images.push(url);
        }
      });
    }
    return images;
  };

  const productImages = getProductImages(product);

  // Enhanced magnifier functionality
  const handleMouseEnter = () => {
    setIsZooming(true);
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setShowMagnifier(false);
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isZooming || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
    
    // Update magnifier position
    const magnifierSize = 200;
    const offsetX = e.clientX - rect.left - magnifierSize / 2;
    const offsetY = e.clientY - rect.top - magnifierSize / 2;
    
    setMagnifierPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setMagnifierOffset({ x: offsetX, y: offsetY });
  };

  const handleWheel = (e) => {
    if (!isZooming) return;
    e.preventDefault();
    
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoomLevel(prev => Math.max(1, Math.min(4, prev + delta)));
  };

  // 360° rotation functionality
  const handle360MouseDown = (e) => {
    if (!is360Mode) return;
    setIsDragging360(true);
    setDragStart(e.clientX);
  };

  const handle360MouseMove = (e) => {
    if (!isDragging360) return;
    
    const sensitivity = 2;
    const deltaX = e.clientX - dragStart;
    const newRotation = (rotation360 + deltaX * sensitivity) % 360;
    
    setRotation360(newRotation < 0 ? newRotation + 360 : newRotation);
    setDragStart(e.clientX);
  };

  const handle360MouseUp = () => {
    setIsDragging360(false);
  };

  // Video functionality
  const toggleVideo = () => {
    setShowVideo(!showVideo);
    if (showVideo) {
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
      setVideoDuration(videoRef.current.duration);
    }
  };

  // Navigation
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Enhanced cart functionality with bulk pricing
  const handleAddToCart = () => {
    if (product && quantity > 0) {
      const effectivePrice = getEffectivePrice();
      const bulkInfo = currentBulkPrice ? {
        isBulkPrice: true,
        originalPrice: product.price,
        bulkPrice: currentBulkPrice,
        bulkDiscount: bulkDiscount,
        bulkTier: Object.keys(product.bulkPricing).find(tier => 
          quantity >= parseInt(tier) && product.bulkPricing[tier] === currentBulkPrice
        )
      } : null;

      // Create enhanced product object for cart
      const cartProduct = {
        ...product,
        effectivePrice: effectivePrice,
        bulkPricing: bulkInfo
      };

      addToCart(cartProduct, quantity);
      
      // Enhanced success notification
      const savings = currentBulkPrice ? (product.price - currentBulkPrice) * quantity : 0;
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl ${
        darkMode ? 'bg-green-800 text-green-200 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'
      } transform transition-all duration-300 max-w-sm`;
      
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <p class="font-semibold">Added to cart!</p>
            <p class="text-sm">${quantity} × ${product.name}</p>
            ${savings > 0 ? `<p class="text-sm font-medium text-green-600">💰 Saved $${savings.toFixed(2)} with bulk pricing!</p>` : ''}
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
    }
  };

  const handleQuantityChange = (value) => {
    if (value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
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
          {/* Enhanced Image Gallery with all features */}
          <div className="space-y-4">
            {/* View Mode Selector */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => {setIs360Mode(false); setShowVideo(false);}}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !is360Mode && !showVideo
                    ? 'bg-indigo-600 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera className="w-4 h-4 inline mr-2" />
                Photos
              </button>
              <button
                onClick={() => {setIs360Mode(true); setShowVideo(false);}}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  is360Mode
                    ? 'bg-indigo-600 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <RotateCw className="w-4 h-4 inline mr-2" />
                360° View
              </button>
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showVideo
                    ? 'bg-indigo-600 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video className="w-4 h-4 inline mr-2" />
                Video
              </button>
            </div>

            {/* Main Display Area */}
            <div 
              className="relative group"
              ref={containerRef}
            >
              <div className={`aspect-square w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl overflow-hidden relative`}>
                {/* Video Mode */}
                {showVideo && mockProductVideo ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      src={mockProductVideo.url}
                      poster={mockProductVideo.thumbnail}
                      className="w-full h-full object-cover"
                      onTimeUpdate={handleVideoTimeUpdate}
                      onLoadedMetadata={handleVideoTimeUpdate}
                    />
                    
                    {/* Video Controls */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={toggleVideoPlay}
                        className="bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-70 transition-colors"
                      >
                        {isVideoPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                      </button>
                    </div>
                    
                    {/* Video Progress Bar */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-3 bg-black bg-opacity-50 rounded-lg p-3">
                        <button onClick={toggleVideoPlay} className="text-white">
                          {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <div className="flex-1 bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-white h-1 rounded-full transition-all"
                            style={{ width: `${(videoCurrentTime / videoDuration) * 100}%` }}
                          />
                        </div>
                        <button onClick={toggleVideoMute} className="text-white">
                          {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setShowFullscreen(true)} className="text-white">
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : is360Mode ? (
                  /* 360° View Mode */
                  <div 
                    className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={handle360MouseDown}
                    onMouseMove={handle360MouseMove}
                    onMouseUp={handle360MouseUp}
                    onMouseLeave={handle360MouseUp}
                  >
                    <img 
                      src={mock360Images[Math.floor((rotation360 / 360) * mock360Images.length)]}
                      alt={`${product.name} 360° view`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    
                    {/* 360° Instructions */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
                      <Move className="w-4 h-4 inline mr-2" />
                      Drag to rotate • {Math.round(rotation360)}°
                    </div>
                  </div>
                ) : (
                  /* Regular Photo Mode with Magnifier */
                  productImages.length > 0 && (
                    <>
                      <img 
                        ref={imageRef}
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