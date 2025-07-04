// src/pages/ProductDetails.jsx - Ultimate e-commerce experience with all premium features
import { useState, useEffect, useRef } from 'react';
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  
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
      
      const productRef = doc(db, 'products', id);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        setError('Product not found');
        setLoading(false);
        return;
      }
      
      const productData = { id: productSnap.id, ...productSnap.data() };
      setProduct(productData);
      
      // Fetch related products
      if (productData.category) {
        const relatedQuery = query(
          collection(db, 'products'),
          where('category', '==', productData.category),
          limit(6)
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 mx-auto"></div>
          <p className={`mt-4 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-8xl mb-6">😵</div>
          <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
          <p className="text-lg mb-8 max-w-md mx-auto">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/catalog"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Browse Catalog
            </Link>
            <button
              onClick={() => navigate(-1)}
              className={`inline-flex items-center px-6 py-3 border rounded-lg font-medium transition-colors ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Breadcrumb */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/catalog" className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}>
              Catalog
            </Link>
            <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            {product.category && (
              <>
                <Link to={`/catalog?category=${product.category}`} className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}>
                  {product.category}
                </Link>
                <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </>
            )}
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium truncate`}>
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
                        className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300"
                        style={{
                          transform: isZooming ? `scale(${zoomLevel})` : 'scale(1)',
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                        onWheel={handleWheel}
                        onClick={() => setShowFullscreen(true)}
                      />
                      
                      {/* Magnifier Lens */}
                      {showMagnifier && (
                        <div
                          ref={magnifierRef}
                          className="absolute pointer-events-none border-2 border-white shadow-lg rounded-full overflow-hidden"
                          style={{
                            width: '200px',
                            height: '200px',
                            left: magnifierOffset.x,
                            top: magnifierOffset.y,
                            backgroundImage: `url(${productImages[activeImageIndex]})`,
                            backgroundSize: `${imageRef.current?.offsetWidth * 2}px ${imageRef.current?.offsetHeight * 2}px`,
                            backgroundPosition: `-${magnifierPosition.x * 2 - 100}px -${magnifierPosition.y * 2 - 100}px`,
                            backgroundRepeat: 'no-repeat',
                            zIndex: 10
                          }}
                        >
                          <div className="absolute inset-0 border-2 border-indigo-500 rounded-full" />
                        </div>
                      )}
                      
                      {/* Zoom Indicator */}
                      {isZooming && (
                        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                          <ZoomIn className="w-4 h-4" />
                          <span>{Math.round(zoomLevel * 100)}%</span>
                        </div>
                      )}

                      {/* Navigation Arrows */}
                      {productImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Fullscreen Button */}
                      <button
                        onClick={() => setShowFullscreen(true)}
                        className="absolute bottom-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </>
                  )
                )}

                {/* Image Counter */}
                {!showVideo && !is360Mode && productImages.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {activeImageIndex + 1} / {productImages.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery (only for photo mode) */}
            {!showVideo && !is360Mode && productImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                      activeImageIndex === index 
                        ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg' 
                        : darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
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

          {/* Enhanced Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {/* SKU and Actions */}
              <div className="flex items-center justify-between mb-3">
                {product.sku && (
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                    SKU: {product.sku}
                  </span>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2 rounded-lg border transition-colors ${
                      isWishlisted 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : darkMode ? 'border-gray-600 text-gray-400 hover:text-red-400' : 'border-gray-200 text-gray-400 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className={`p-2 rounded-lg border transition-colors ${
                      darkMode ? 'border-gray-600 text-gray-400 hover:text-indigo-400' : 'border-gray-200 text-gray-400 hover:text-indigo-600'
                    }`}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 leading-tight`}>
                {product.name}
              </h1>

              {/* Rating (mock for now) */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  4.0 (123 reviews)
                </span>
              </div>
            </div>

            {/* Enhanced Pricing with Bulk Pricing */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${getEffectivePrice().toFixed(2)}
                  {currentBulkPrice && (
                    <span className="text-lg text-green-600 ml-2">each</span>
                  )}
                </span>
                
                {/* Show original price if bulk pricing applies */}
                {currentBulkPrice && (
                  <div className="flex items-center space-x-2">
                    <span className={`text-xl line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Save {bulkDiscount.toFixed(0)}%
                    </span>
                  </div>
                )}
                
                {/* Original MSRP discount */}
                {!currentBulkPrice && product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex items-center space-x-2">
                    <span className={`text-xl line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ${Number(product.originalPrice).toFixed(2)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Bulk Pricing Alert */}
              {currentBulkPrice && (
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                      🎉 Bulk Pricing Applied!
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'}`}>
                    You're saving ${((product.price - currentBulkPrice) * quantity).toFixed(2)} 
                    with {quantity}+ unit pricing ({bulkDiscount.toFixed(0)}% off each item)
                  </p>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    product.stock > 10 ? 'bg-green-500' : 
                    product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium">
                    {product.stock > 0 ? (
                      product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`
                    ) : 'Out of Stock'}
                  </span>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.category}
                </span>
              </div>
            </div>

            {/* Enhanced Bulk Pricing Display */}
            {product.bulkPricing && Object.keys(product.bulkPricing).length > 0 && (
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                <h4 className={`font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  💰 Volume Discounts Available
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(product.bulkPricing).map(([qty, price]) => {
                    const isActive = quantity >= parseInt(qty) && currentBulkPrice === price;
                    return (
                      <div 
                        key={qty} 
                        className={`text-center p-4 rounded-lg border-2 transition-all ${
                          isActive 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
                            : darkMode ? 'border-blue-700 bg-blue-800/30' : 'border-blue-200 bg-white'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isActive ? 'text-green-700 dark:text-green-300' : darkMode ? 'text-blue-200' : 'text-blue-700'
                        }`}>
                          {qty}+ units
                          {isActive && (
                            <span className="block text-xs font-semibold text-green-600">
                              ✓ ACTIVE
                            </span>
                          )}
                        </div>
                        <div className={`text-lg font-bold ${
                          isActive ? 'text-green-800 dark:text-green-100' : darkMode ? 'text-blue-100' : 'text-blue-800'
                        }`}>
                          ${Number(price).toFixed(2)}
                        </div>
                        <div className={`text-xs ${
                          isActive ? 'text-green-600 dark:text-green-400' : darkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          Save {(((product.price - price) / product.price) * 100).toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Enhanced Add to Cart Section */}
            {product.stock > 0 && (
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
                <div className="flex items-center space-x-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Quantity
                    </label>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className={`px-4 py-2 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 disabled:opacity-50' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                        } disabled:cursor-not-allowed transition-colors`}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className={`w-20 px-4 py-2 text-center border-0 ${
                          darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-900'
                        } focus:ring-0 focus:outline-none`}
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className={`px-4 py-2 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 disabled:opacity-50' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                        } disabled:cursor-not-allowed transition-colors`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                      Total Price
                    </p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${(getEffectivePrice() * quantity).toFixed(2)}
                    </p>
                    {currentBulkPrice && (
                      <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                        💰 Saved ${((product.price - currentBulkPrice) * quantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-colors shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>
                    Add to Cart
                    {currentBulkPrice && (
                      <span className="text-sm font-normal ml-2">
                        (${getEffectivePrice().toFixed(2)} each)
                      </span>
                    )}
                  </span>
                </button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Truck className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>Free Shipping</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Orders over $50</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Shield className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>Warranty</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>1 year coverage</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <RefreshCw className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>Returns</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>30 day policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    selectedTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : darkMode 
                        ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {selectedTab === 'description' && (
              <div className="prose max-w-none">
                <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {product.description || 'No description available for this product.'}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Product Details
                  </h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</dt>
                      <dd className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{product.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>SKU</dt>
                      <dd className={`text-sm font-medium font-mono ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{product.sku || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Supplier</dt>
                      <dd className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{product.supplier || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock</dt>
                      <dd className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{product.stock} units</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bulk Pricing</dt>
                      <dd className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {Object.keys(product.bulkPricing || {}).length > 0 ? 'Available' : 'Not Available'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="text-center py-12">
                <Star className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <h4 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Reviews Yet
                </h4>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
              You might also like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} darkMode={darkMode} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-screen p-4">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {showVideo && mockProductVideo ? (
              <video
                src={mockProductVideo.url}
                controls
                autoPlay
                className="max-w-full max-h-full"
              />
            ) : (
              <img
                src={productImages[activeImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
            )}
            
            {!showVideo && productImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {showVideo ? 'Product Video' : `${activeImageIndex + 1} / ${productImages.length}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ product, darkMode }) => {
  return (
    <Link
      to={`/products/${product.id}`}
      className={`group block ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}
    >
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
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

      <div className="p-4">
        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors`}>
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ${Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className={`text-sm line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          <span className={`text-sm ${
            product.stock > 10 ? 'text-green-600' : 
            product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductDetails;