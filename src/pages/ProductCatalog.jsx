// src/pages/ProductCatalog.jsx - 🎨 ENHANCED THEME INTEGRATION
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import SecretInvasionBackground from "../components/common/SecretInvasionBackground";

const ProductCatalog = () => {
  const { darkMode } = useTheme();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Get theme prefixes
  const themePrefix = darkMode ? "cyber" : "neumorph";
  const layoutPrefix = darkMode ? "cyberpunk" : "neumorph";

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get("search");
    const categoryParam = urlParams.get("category");

    if (searchParam) {
      setSearchTerm(searchParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    setIsVisible(true);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);

      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    return uniqueCategories.sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const inStock = product.stock > 0;

      return matchesSearch && matchesCategory && inStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price" || sortBy === "stock") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, sortDirection]);

  // Handle add to cart
  const handleAddToCart = (product, quantity = 1) => {
    if (quantity > product.stock) {
      // Enhanced notification with theme styling
      showNotification(
        `Only ${product.stock} items available in stock`,
        "warning",
      );
      return;
    }

    addToCart(product, quantity);
    showNotification(`Added ${product.name} to cart!`, "success");
  };

  // Enhanced notification system
  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg transform transition-all duration-500 animate-slideInRight ${
      type === "success"
        ? darkMode
          ? "bg-green-900/90 border-2 border-green-500 text-green-400 cyber-glow"
          : "bg-green-500 text-white neumorph-elevated"
        : darkMode
          ? "bg-yellow-900/90 border-2 border-yellow-500 text-yellow-400 cyber-glow"
          : "bg-yellow-500 text-white neumorph-elevated"
    } backdrop-blur-lg shadow-2xl font-bold`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(100%) scale(0.8)";
      notification.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  };

  // Get cart quantity for product
  const getCartQuantity = (productId) => {
    const cartItem = cart.find((item) => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Loading State with Theme
  if (loading) {
    return (
      <div
        className={`${layoutPrefix}-layout-wrapper min-h-screen transition-all duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <SecretInvasionBackground intensity={0.3} enableGlitch={darkMode} />

        {/* Theme-specific background effects */}
        {darkMode ? (
          <>
            <div className="fixed inset-0 z-2 opacity-10 pointer-events-none">
              <div className="cyberpunk-grid"></div>
            </div>
            <div className="fixed inset-0 z-3 pointer-events-none opacity-20">
              <div className="scanlines"></div>
            </div>
          </>
        ) : (
          <div className="fixed inset-0 z-2 opacity-15 pointer-events-none">
            <div className="neumorph-grid"></div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className={`${themePrefix}-loading-spinner`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State with Theme
  if (error) {
    return (
      <div className={`${layoutPrefix}-layout-wrapper min-h-screen`}>
        <SecretInvasionBackground intensity={0.3} enableGlitch={darkMode} />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div
            className={`${themePrefix}-card p-8 max-w-md mx-auto text-center animate-shake`}
          >
            {darkMode && <div className="card-glow"></div>}
            {!darkMode && <div className="neumorph-card-glow"></div>}

            <div className="text-6xl mb-4">⚠️</div>
            <h3
              className={`text-xl font-bold mb-4 ${
                darkMode
                  ? "cyber-title text-red-400"
                  : "neumorph-title text-red-600"
              }`}
            >
              {darkMode ? "NEURAL NETWORK ERROR" : "Loading Error"}
            </h3>
            <p className={`mb-6 ${darkMode ? "text-red-300" : "text-red-600"}`}>
              {error}
            </p>
            <button
              onClick={fetchProducts}
              className={`${themePrefix}-btn ${themePrefix}-btn-red`}
            >
              <span className="font-bold">
                {darkMode ? "RETRY CONNECTION" : "Try Again"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${layoutPrefix}-layout-wrapper min-h-screen transition-all duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* SECRET INVASION BACKGROUND */}
      <SecretInvasionBackground intensity={0.4} enableGlitch={darkMode} />

      {/* Theme-specific background effects */}
      {darkMode ? (
        <>
          <div className="fixed inset-0 z-2 opacity-10 pointer-events-none">
            <div className="cyberpunk-grid"></div>
          </div>
          <div className="fixed inset-0 z-3 pointer-events-none opacity-20">
            <div className="scanlines"></div>
          </div>
        </>
      ) : (
        <>
          <div className="fixed inset-0 z-2 opacity-15 pointer-events-none">
            <div className="neumorph-grid"></div>
          </div>
          <div className="fixed inset-0 z-3 opacity-8 pointer-events-none">
            <div className="neumorph-gradient"></div>
          </div>
        </>
      )}

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 animate-slideInUp">
          <div>
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                darkMode
                  ? "cyber-title cyber-glow text-cyan-400"
                  : "neumorph-title text-blue-600"
              }`}
            >
              {darkMode ? "PRODUCT MATRIX" : "Product Catalog"}
            </h1>
            <p
              className={`text-xl ${
                darkMode ? "text-cyan-200" : "text-gray-700"
              }`}
            >
              {darkMode
                ? "Explore our quantum-organized product database"
                : "Discover our wide range of wholesale products"}
            </p>
          </div>

          {/* Enhanced Cart Button */}
          <div className="mt-6 lg:mt-0">
            <Link
              to="/cart"
              className={`${themePrefix}-btn ${themePrefix}-btn-primary group transition-all duration-300 hover:scale-110`}
            >
              {darkMode && <div className="btn-glow"></div>}
              {!darkMode && <div className="neumorph-btn-glow"></div>}

              <svg
                className="btn-icon mr-3 group-hover:bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              <span className="btn-text font-bold">
                {darkMode ? "CART MATRIX" : "Shopping Cart"}
              </span>
              {cart.length > 0 && (
                <span
                  className={`ml-3 px-3 py-1 text-sm rounded-full font-bold animate-pulse ${
                    darkMode
                      ? "bg-yellow-600 text-black"
                      : "bg-indigo-800 text-white"
                  }`}
                >
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div
          className={`${themePrefix}-card p-8 mb-8 transition-all duration-500 hover:scale-[1.02] animate-slideInUp`}
          style={{ animationDelay: "200ms" }}
        >
          {darkMode && <div className="card-glow"></div>}
          {!darkMode && <div className="neumorph-card-glow"></div>}

          {/* Enhanced Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className={`h-6 w-6 ${darkMode ? "text-cyan-400" : "text-blue-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder={
                darkMode
                  ? "Search neural product matrix..."
                  : "Search products, categories, descriptions..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 text-lg font-medium transition-all duration-300 focus:scale-[1.02] ${
                darkMode
                  ? "bg-gray-900 border-2 border-cyan-600 text-cyan-100 focus:border-cyan-400 rounded-lg placeholder-cyan-700"
                  : "bg-gray-50 border-2 border-blue-300 text-gray-900 focus:border-blue-500 rounded-lg placeholder-gray-500"
              }`}
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${themePrefix}-btn ${themePrefix}-btn-outline w-full group transition-all duration-300`}
            >
              <svg
                className="btn-icon mr-3 group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="btn-text font-bold">
                {darkMode ? "FILTER MATRIX" : "Filters & Sorting"}
              </span>
            </button>
          </div>

          {/* Enhanced Filters and Controls */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 ${showFilters ? "block" : "hidden lg:grid"}`}
          >
            {/* Category Filter */}
            <div
              className="animate-slideInUp"
              style={{ animationDelay: "100ms" }}
            >
              <label
                className={`block text-sm font-bold mb-3 ${
                  darkMode
                    ? "cyber-title text-cyan-400"
                    : "neumorph-title text-blue-600"
                }`}
              >
                {darkMode ? "CATEGORY MATRIX" : "Category"}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-4 py-3 font-medium transition-all duration-300 focus:scale-105 ${
                  darkMode
                    ? "bg-gray-900 border-2 border-cyan-600 text-cyan-100 focus:border-cyan-400 rounded-lg"
                    : "bg-gray-50 border-2 border-blue-300 text-gray-900 focus:border-blue-500 rounded-lg"
                }`}
              >
                <option value="all">
                  {darkMode ? "ALL SECTORS" : "All Categories"}
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div
              className="animate-slideInUp"
              style={{ animationDelay: "200ms" }}
            >
              <label
                className={`block text-sm font-bold mb-3 ${
                  darkMode
                    ? "cyber-title text-cyan-400"
                    : "neumorph-title text-blue-600"
                }`}
              >
                {darkMode ? "SORT PROTOCOL" : "Sort By"}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-3 font-medium transition-all duration-300 focus:scale-105 ${
                  darkMode
                    ? "bg-gray-900 border-2 border-cyan-600 text-cyan-100 focus:border-cyan-400 rounded-lg"
                    : "bg-gray-50 border-2 border-blue-300 text-gray-900 focus:border-blue-500 rounded-lg"
                }`}
              >
                <option value="name">
                  {darkMode ? "NEURAL NAME" : "Name"}
                </option>
                <option value="price">
                  {darkMode ? "CREDIT VALUE" : "Price"}
                </option>
                <option value="category">
                  {darkMode ? "SECTOR CLASS" : "Category"}
                </option>
                <option value="stock">
                  {darkMode ? "INVENTORY COUNT" : "Stock"}
                </option>
              </select>
            </div>

            {/* Sort Direction */}
            <div
              className="animate-slideInUp"
              style={{ animationDelay: "300ms" }}
            >
              <label
                className={`block text-sm font-bold mb-3 ${
                  darkMode
                    ? "cyber-title text-cyan-400"
                    : "neumorph-title text-blue-600"
                }`}
              >
                {darkMode ? "ORDER MATRIX" : "Order"}
              </label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                className={`w-full px-4 py-3 font-medium transition-all duration-300 focus:scale-105 ${
                  darkMode
                    ? "bg-gray-900 border-2 border-cyan-600 text-cyan-100 focus:border-cyan-400 rounded-lg"
                    : "bg-gray-50 border-2 border-blue-300 text-gray-900 focus:border-blue-500 rounded-lg"
                }`}
              >
                <option value="asc">
                  {darkMode ? "ASCENDING ORDER" : "Ascending"}
                </option>
                <option value="desc">
                  {darkMode ? "DESCENDING ORDER" : "Descending"}
                </option>
              </select>
            </div>

            {/* View Mode */}
            <div
              className="animate-slideInUp"
              style={{ animationDelay: "400ms" }}
            >
              <label
                className={`block text-sm font-bold mb-3 ${
                  darkMode
                    ? "cyber-title text-cyan-400"
                    : "neumorph-title text-blue-600"
                }`}
              >
                {darkMode ? "VIEW MATRIX" : "Display Mode"}
              </label>
              <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 px-4 py-3 text-sm font-bold rounded-l-lg transition-all duration-300 ${
                    viewMode === "grid"
                      ? darkMode
                        ? "bg-cyan-600 text-black"
                        : "bg-blue-600 text-white"
                      : darkMode
                        ? "bg-gray-700 text-cyan-300 hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {darkMode ? "GRID MODE" : "Grid"}
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 px-4 py-3 text-sm font-bold rounded-r-lg transition-all duration-300 ${
                    viewMode === "list"
                      ? darkMode
                        ? "bg-cyan-600 text-black"
                        : "bg-blue-600 text-white"
                      : darkMode
                        ? "bg-gray-700 text-cyan-300 hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {darkMode ? "LIST MODE" : "List"}
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div
              className="flex items-end animate-slideInUp"
              style={{ animationDelay: "500ms" }}
            >
              <div className={`${themePrefix}-card p-4 w-full text-center`}>
                <div
                  className={`text-2xl font-bold ${
                    darkMode ? "text-cyan-400 cyber-glow" : "text-blue-600"
                  }`}
                >
                  {filteredAndSortedProducts.length}
                </div>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-cyan-200" : "text-gray-600"
                  }`}
                >
                  {darkMode ? "NEURAL PRODUCTS" : "Products Found"}
                </p>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory !== "all") && (
              <div
                className="flex items-end animate-slideInUp"
                style={{ animationDelay: "600ms" }}
              >
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className={`${themePrefix}-btn ${themePrefix}-btn-red w-full transition-all duration-300 hover:scale-105`}
                >
                  <span className="font-bold">
                    {darkMode ? "RESET MATRIX" : "Clear Filters"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Products Display */}
        {filteredAndSortedProducts.length === 0 ? (
          <div
            className={`${themePrefix}-card p-16 text-center animate-slideInUp`}
          >
            {darkMode && <div className="card-glow"></div>}
            {!darkMode && <div className="neumorph-card-glow"></div>}

            <div className="text-8xl mb-6 animate-bounce">
              {darkMode ? "🔍" : "📦"}
            </div>
            <h3
              className={`text-2xl font-bold mb-4 ${
                darkMode
                  ? "cyber-title text-cyan-400"
                  : "neumorph-title text-blue-600"
              }`}
            >
              {darkMode ? "NO NEURAL PRODUCTS FOUND" : "No Products Found"}
            </h3>
            <p
              className={`text-lg mb-8 ${
                darkMode ? "text-cyan-200" : "text-gray-600"
              }`}
            >
              {searchTerm || selectedCategory !== "all"
                ? darkMode
                  ? "Try adjusting your neural search parameters"
                  : "Try adjusting your search or filters"
                : darkMode
                  ? "No products detected in the neural matrix"
                  : "No products available at the moment"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className={`${themePrefix}-btn ${themePrefix}-btn-primary transition-all duration-300 hover:scale-110`}
              >
                <span className="font-bold">
                  {darkMode ? "RESET NEURAL MATRIX" : "Clear All Filters"}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "space-y-6"
            }
          >
            {filteredAndSortedProducts.map((product, index) =>
              viewMode === "grid" ? (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  cartQuantity={getCartQuantity(product.id)}
                  darkMode={darkMode}
                  themePrefix={themePrefix}
                  index={index}
                />
              ) : (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  cartQuantity={getCartQuantity(product.id)}
                  darkMode={darkMode}
                  themePrefix={themePrefix}
                  index={index}
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// Enhanced Product Card Component for Grid View
const ProductCard = ({
  product,
  onAddToCart,
  cartQuantity,
  darkMode,
  themePrefix,
  index,
}) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className={`${themePrefix}-card group transition-all duration-500 hover:scale-105 hover:rotate-1 animate-slideInUp overflow-hidden`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {darkMode && <div className="card-glow"></div>}
      {!darkMode && <div className="neumorph-card-glow"></div>}

      {/* Enhanced Product Image */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-w-1 aspect-h-1 w-full h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl animate-bounce group-hover:scale-125 transition-transform duration-300">
                📦
              </span>
            </div>
          )}

          {/* Enhanced Stock Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md transition-all duration-300 group-hover:scale-110 ${
                product.stock <= 5
                  ? darkMode
                    ? "bg-red-900/80 text-red-400 border border-red-600"
                    : "bg-red-100 text-red-800 border border-red-300"
                  : product.stock <= 20
                    ? darkMode
                      ? "bg-yellow-900/80 text-yellow-400 border border-yellow-600"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : darkMode
                      ? "bg-green-900/80 text-green-400 border border-green-600"
                      : "bg-green-100 text-green-800 border border-green-300"
              }`}
            >
              {product.stock} {darkMode ? "LEFT" : "left"}
            </span>
          </div>
        </div>
      </Link>

      {/* Enhanced Product Info */}
      <div className="p-6">
        <Link to={`/products/${product.id}`}>
          <h3
            className={`font-bold text-lg mb-2 line-clamp-2 transition-all duration-300 group-hover:scale-105 ${
              darkMode
                ? "cyber-title text-cyan-400 hover:text-cyan-300 hover:cyber-glow"
                : "neumorph-title text-blue-600 hover:text-blue-800"
            }`}
          >
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p
            className={`text-sm font-medium mb-3 ${
              darkMode ? "text-purple-400" : "text-indigo-600"
            }`}
          >
            {product.category}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-2xl font-bold ${
              darkMode ? "text-cyan-400 cyber-glow" : "text-blue-600"
            }`}
          >
            ${Number(product.price).toFixed(2)}
          </span>
          {cartQuantity > 0 && (
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full animate-pulse ${
                darkMode
                  ? "bg-yellow-900/50 text-yellow-400 border border-yellow-600"
                  : "bg-indigo-100 text-indigo-800 border border-indigo-300"
              }`}
            >
              {cartQuantity} in cart
            </span>
          )}
        </div>

        {/* Enhanced Add to Cart Controls */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={`w-10 h-10 rounded-full font-bold transition-all duration-300 hover:scale-110 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-600"
                  : "bg-gray-100 hover:bg-gray-200 text-blue-600 border border-blue-300"
              }`}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(product.stock, parseInt(e.target.value) || 1),
                  ),
                )
              }
              className={`flex-1 text-center py-2 px-3 font-bold transition-all duration-300 focus:scale-105 ${
                darkMode
                  ? "bg-gray-900 border-2 border-cyan-600 text-cyan-100 focus:border-cyan-400 rounded-lg"
                  : "bg-gray-50 border-2 border-blue-300 text-gray-900 focus:border-blue-500 rounded-lg"
              }`}
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className={`w-10 h-10 rounded-full font-bold transition-all duration-300 hover:scale-110 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-600"
                  : "bg-gray-100 hover:bg-gray-200 text-blue-600 border border-blue-300"
              }`}
            >
              +
            </button>
          </div>

          <button
            onClick={() => onAddToCart(product, quantity)}
            className={`${themePrefix}-btn ${themePrefix}-btn-primary w-full transition-all duration-300 hover:scale-105`}
          >
            <span className="font-bold">
              {darkMode ? "ADD TO CART MATRIX" : "Add to Cart"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Product List Item Component for List View
const ProductListItem = ({
  product,
  onAddToCart,
  cartQuantity,
  darkMode,
  themePrefix,
  index,
}) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className={`${themePrefix}-card p-6 transition-all duration-500 hover:scale-[1.02] animate-slideInUp`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {darkMode && <div className="card-glow"></div>}
      {!darkMode && <div className="neumorph-card-glow"></div>}

      <div className="flex items-center space-x-6">
        {/* Enhanced Product Image */}
        <Link to={`/products/${product.id}`} className="flex-shrink-0 group">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-110">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-3xl animate-bounce">📦</span>
              </div>
            )}
          </div>
        </Link>

        {/* Enhanced Product Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/products/${product.id}`}>
            <h3
              className={`font-bold text-xl mb-2 transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "cyber-title text-cyan-400 hover:text-cyan-300 hover:cyber-glow"
                  : "neumorph-title text-blue-600 hover:text-blue-800"
              }`}
            >
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center space-x-4 text-sm mb-3">
            {product.category && (
              <span
                className={`px-3 py-1 rounded-lg font-bold ${
                  darkMode
                    ? "bg-purple-900/50 text-purple-400 border border-purple-600"
                    : "bg-indigo-100 text-indigo-800 border border-indigo-300"
                }`}
              >
                {product.category}
              </span>
            )}
            <span
              className={`font-medium ${
                darkMode ? "text-cyan-300" : "text-gray-600"
              }`}
            >
              Stock: <span className="font-bold">{product.stock}</span>
            </span>
            {cartQuantity > 0 && (
              <span
                className={`px-3 py-1 rounded-full font-bold animate-pulse ${
                  darkMode
                    ? "bg-yellow-900/50 text-yellow-400 border border-yellow-600"
                    : "bg-indigo-100 text-indigo-800 border border-indigo-300"
                }`}
              >
                {cartQuantity} in cart
              </span>
            )}
          </div>

          {product.description && (
            <p
              className={`text-sm leading-relaxed line-clamp-2 ${
                darkMode ? "text-cyan-200" : "text-gray-600"
              }`}
            >
              {product.description}
            </p>
          )}
        </div>

        {/* Enhanced Price and Actions */}
        <div className="flex items-center space-x-6">
          <span
            className={`text-3xl font-bold ${
              darkMode ? "text-cyan-400 cyber-glow" : "text-blue-600"
            }`}
          >
            ${Number(product.price).toFixed(2)}
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={`w-10 h-10 rounded-full font-bold transition-all duration-300 hover:scale-110 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-600"
                  : "bg-gray-100 hover:bg-gray-200 text-blue-600 border border-blue-300"
              }`}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(product.stock, parseInt(e.target.value) || 1),
                  ),
                )
              }
              className={`w-20 text-center py-2 px-3 font-bold transition-all duration-300 focus:scale-105 ${
                darkMode
                  ? "bg-gray-900 border-2 border-cyan-600 text-cyan-100 focus:border-cyan-400 rounded-lg"
                  : "bg-gray-50 border-2 border-blue-300 text-gray-900 focus:border-blue-500 rounded-lg"
              }`}
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className={`w-10 h-10 rounded-full font-bold transition-all duration-300 hover:scale-110 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-cyan-400 border border-cyan-600"
                  : "bg-gray-100 hover:bg-gray-200 text-blue-600 border border-blue-300"
              }`}
            >
              +
            </button>
          </div>

          <button
            onClick={() => onAddToCart(product, quantity)}
            className={`${themePrefix}-btn ${themePrefix}-btn-primary transition-all duration-300 hover:scale-105`}
          >
            <span className="font-bold">
              {darkMode ? "ADD TO MATRIX" : "Add to Cart"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
