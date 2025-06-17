import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ProtectedRoute from './components/common/ProtectedRoute';
import NoShoppingRedirect from './components/common/NoShoppingRedirect';
import QRPage from './pages/QRPage';

// Lazy-loaded components for better performance
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));
const GuestDashboard = lazy(() => import('./pages/GuestDashboard'));
const Home = lazy(() => import('./pages/Home'));
const Inventory = lazy(() => import('./pages/Inventory'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'));
const Orders = lazy(() => import('./pages/Orders'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const OrderDetails = lazy(() => import('./pages/Orders/OrderDetails'));
const InvoicePage = lazy(() => import('./pages/Orders/InvoicePage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Support and feedback pages
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const SupportCenter = lazy(() => import('./pages/SupportCenter'));
const OrderProcessing = lazy(() => import('./pages/OrderProcessing'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Documentation = lazy(() => import('./pages/Documentation'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
// Add these lines after the existing lazy imports in App.jsx
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const ContactSupport = lazy(() => import('./pages/ContactSupport'));

// Admin components
const UserApprovalDashboard = lazy(() => import('./pages/admin/UserApprovalDashboard'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));

// User-specific components
const UserSpecificOrders = lazy(() => import('./components/UserSpecificOrders'));

// Startup Animation Component
const StartupAnimation = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [bootStage, setBootStage] = useState(0);

  const bootMessages = [
    'INITIALIZING WHOLESALER SYSTEM...',
    'LOADING COMPONENTS...',
    'CONNECTING TO SERVERS...',
    'SYSTEM READY'
  ];

  // Hacker text effect
  useEffect(() => {
    if (bootStage < bootMessages.length) {
      const targetText = bootMessages[bootStage];
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let iterations = 0;
      
      const interval = setInterval(() => {
        setDisplayText(
          targetText
            .split('')
            .map((char, index) => {
              if (index < iterations) {
                return targetText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iterations >= targetText.length) {
          clearInterval(interval);
        }
        iterations += 1 / 3;
      }, 30);

      return () => clearInterval(interval);
    }
  }, [bootStage]);

  // Progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        
        const stage = Math.floor(newProgress / 25);
        if (stage !== bootStage && stage < bootMessages.length) {
          setBootStage(stage);
        }
        
        return newProgress;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [bootStage, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid-pattern"></div>
      </div>

      <div className="text-center space-y-8 relative z-10 max-w-2xl px-8">
        {/* Logo */}
        <div className="mb-12">
          <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4 animate-pulse">
            WHOLESALER
          </div>
          <div className="text-sm text-gray-400 font-mono">
            LOADING PLATFORM...
          </div>
        </div>

        {/* Boot Messages */}
        <div className="h-12 flex items-center justify-center">
          <div className="text-cyan-400 font-mono text-lg">
            {displayText}
            <span className="animate-pulse">_</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span className="font-mono">LOADING</span>
            <span className="font-mono">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* System Status */}
        <div className="flex justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400 font-mono">SECURE</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400 font-mono">ONLINE</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400 font-mono">READY</span>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          width: 100%;
          height: 100%;
          animation: gridMove 10s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 20px); }
        }
      `}</style>
    </div>
  );
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

function App() {
  const [isBooting, setIsBooting] = useState(true);

  const handleBootComplete = () => {
    setIsBooting(false);
  };

  // Show startup animation first
  if (isBooting) {
    return <StartupAnimation onComplete={handleBootComplete} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes - No authentication required */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                
                {/* Home Route - Default landing page for everyone */}
                <Route path="/" element={
                  <Layout>
                    <Home />
                  </Layout>
                } />

                {/* Guest accessible routes */}
                <Route path="/guest-dashboard" element={
                  <Layout>
                    <GuestDashboard />
                  </Layout>
                } />

                {/* QR Tools - Protected route */}
                <Route path="/qr-tools" element={
                  <ProtectedRoute>
                    <Layout>
                      <QRPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Product catalog routes - Public access */}
                <Route path="/catalog" element={
                  <Layout>
                    <ProductCatalog />
                  </Layout>
                } />

                <Route path="/products" element={
                  <Layout>
                    <ProductCatalog />
                  </Layout>
                } />

                <Route path="/products/:id" element={
                  <Layout>
                    <ProductDetails />
                  </Layout>
                } />

                <Route path="/browse" element={
                  <Layout>
                    <ProductCatalog />
                  </Layout>
                } />

                {/* Help Center - Public access */}
<Route path="/help-center" element={
  <Layout>
    <HelpCenter />
  </Layout>
} />

{/* Contact Support - Public access */}
<Route path="/contact-support" element={
  <Layout>
    <ContactSupport />
  </Layout>
} />

                {/* Shopping routes - restricted for admin/manager */}
                <Route path="/cart" element={
                  <NoShoppingRedirect type="cart">
                    <Layout>
                      <Cart />
                    </Layout>
                  </NoShoppingRedirect>
                } />

                <Route path="/checkout" element={
                  <NoShoppingRedirect type="checkout">
                    <Layout>
                      <Checkout />
                    </Layout>
                  </NoShoppingRedirect>
                } />

                {/* Feedback Page - Protected route for authenticated users */}
                <Route path="/feedback" element={
                  <ProtectedRoute>
                    <Layout>
                      <FeedbackPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Role-specific dashboard routes with access control */}
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/business-dashboard" element={
                  <ProtectedRoute requiredRole="business">
                    <Layout>
                      <BusinessDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/manager-dashboard" element={
                  <ProtectedRoute requiredRole="manager">
                    <Layout>
                      <ManagerDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/user-dashboard" element={
                  <ProtectedRoute requiredRole="user">
                    <Layout>
                      <UserDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Admin Routes - Admin access only */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Routes>
                        <Route index element={<AdminPanel />} />
                        <Route path="users" element={<UserApprovalDashboard />} />
                        <Route path="approvals" element={<UserApprovalDashboard />} />
                        <Route path="pending-approvals" element={<UserApprovalDashboard />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* User Management - Admin and Manager access */}
                <Route path="/user-management" element={
                  <ProtectedRoute 
                    allowedRoles={['admin', 'manager']} 
                    requiredPermission="canApproveUsers"
                  >
                    <Layout>
                      <UserApprovalDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Inventory routes - Let components handle permissions */}
                <Route path="/inventory" element={
                  <ProtectedRoute>
                    <Layout>
                      <Inventory />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProductDetail />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Add Product route - Let component handle permissions */}
                <Route path="/add-product" element={
                  <ProtectedRoute>
                    <Layout>
                      <AddProduct />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Orders routes - Protected with user-specific filtering */}
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Layout>
                      <UserSpecificOrders />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Support and Information Pages - Public access */}
                <Route path="/about-us" element={
                  <Layout>
                    <AboutUs />
                  </Layout>
                } />

                <Route path="/documentation" element={
                  <Layout>
                    <Documentation />
                  </Layout>
                } />

                <Route path="/privacy-policy" element={
                  <Layout>
                    <PrivacyPolicy />
                  </Layout>
                } />

                <Route path="/support-center" element={
                  <Layout>
                    <SupportCenter />
                  </Layout>
                } />

                <Route path="/order-processing" element={
                  <Layout>
                    <OrderProcessing />
                  </Layout>
                } />
                
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <OrderDetails />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/generate-invoice/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <InvoicePage />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Create Order - Restricted for admin/manager */}
                <Route path="/create-order" element={
                  <NoShoppingRedirect type="orders">
                    <ProtectedRoute>
                      <Layout>
                        <CreateOrder />
                      </Layout>
                    </ProtectedRoute>
                  </NoShoppingRedirect>
                } />

                {/* Manager-only routes - Enhanced with nested routing */}
                <Route path="/manager/*" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Layout>
                      <Routes>
                        <Route index element={
                          <div className="p-8">
                            <h1 className="text-2xl font-bold mb-4">Manager Panel</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Comprehensive management tools and analytics for operations oversight.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <Link to="/manager/users" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-4">👥</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Manage users and approvals</p>
                                  </div>
                                </div>
                              </Link>
                              
                              <Link to="/manager/inventory" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-4">📦</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Control</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Manage products and stock</p>
                                  </div>
                                </div>
                              </Link>
                              
                              <Link to="/add-product" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-4">➕</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Product</h3>
                                    <p className="text-gray-600 dark:text-gray-400">List new products</p>
                                  </div>
                                </div>
                              </Link>
                              
                              <Link to="/manager/orders" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-4">📋</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Management</h3>
                                    <p className="text-gray-600 dark:text-gray-400">View and process all orders</p>
                                  </div>
                                </div>
                              </Link>
                              
                              <Link to="/manager/analytics" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-4">📊</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Performance metrics</p>
                                  </div>
                                </div>
                              </Link>
                              
                              <Link to="/manager/reports" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-4">📈</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reports</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Generate detailed reports</p>
                                  </div>
                                </div>
                              </Link>
                              
                              <Link to="/manager/settings" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-4">⚙</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
                                    <p className="text-gray-600 dark:text-gray-400">System configuration</p>
                                  </div>
                                </div>
                              </Link>

                              {/* Add Feedback Management for Managers */}
                              <Link to="/manager/feedback" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-4">💬</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback Management</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Review customer feedback</p>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        } />
                        
                        <Route path="users" element={<UserApprovalDashboard />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="orders" element={<UserSpecificOrders />} />
                        <Route path="feedback" element={<FeedbackPage />} />
                        
                        <Route path="analytics" element={
                          <div className="p-8">
                            <h1 className="text-2xl font-bold mb-4">Manager Analytics</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Comprehensive analytics and performance metrics.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Team Performance</h3>
                                <p className="text-gray-600 dark:text-gray-400">Monitor team productivity and efficiency</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">System Health</h3>
                                <p className="text-gray-600 dark:text-gray-400">Platform performance metrics</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Revenue Trends</h3>
                                <p className="text-gray-600 dark:text-gray-400">Financial performance analysis</p>
                              </div>
                            </div>
                          </div>
                        } />
                        
                        <Route path="reports" element={
                          <div className="p-8">
                            <h1 className="text-2xl font-bold mb-4">Manager Reports</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Generate and download detailed reports.</p>
                            <div className="space-y-4">
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Monthly Summary Report</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Comprehensive monthly business overview</p>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Generate Report</button>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Inventory Report</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Stock levels and inventory analysis</p>
                                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Generate Report</button>
                              </div>
                            </div>
                          </div>
                        } />
                        
                        <Route path="settings" element={
                          <div className="p-8">
                            <h1 className="text-2xl font-bold mb-4">Manager Settings</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">System configuration and preferences.</p>
                            <div className="space-y-4">
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">System Configuration</h3>
                                <p className="text-gray-600 dark:text-gray-400">Configure system-wide settings</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">User Permissions</h3>
                                <p className="text-gray-600 dark:text-gray-400">Manage user roles and permissions</p>
                              </div>
                            </div>
                          </div>
                        } />
                        
                        <Route path="*" element={<Navigate to="/manager" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Business-specific routes - Let components handle permissions */}
                <Route path="/business/*" element={
                  <ProtectedRoute requiredRole="business">
                    <Layout>
                      <Routes>
                        <Route index element={<BusinessDashboard />} />
                        
                        <Route path="products" element={
                          <ProtectedRoute>
                            <Inventory />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="add-product" element={
                          <ProtectedRoute>
                            <AddProduct />
                          </ProtectedRoute>
                        } />

                        <Route path="inventory" element={
                          <ProtectedRoute>
                            <Inventory />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="orders" element={
                          <UserSpecificOrders />
                        } />

                        {/* Add feedback access for business users */}
                        <Route path="feedback" element={<FeedbackPage />} />
                        
                        <Route path="analytics" element={
                          <div className="p-8">
                            <h1 className="text-2xl font-bold mb-4">Business Analytics</h1>
                            <p>Detailed analytics and performance metrics would go here.</p>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Sales Overview</h3>
                                <p className="text-gray-600 dark:text-gray-400">Monthly sales performance</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Customer Insights</h3>
                                <p className="text-gray-600 dark:text-gray-400">Customer behavior analysis</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Product Performance</h3>
                                <p className="text-gray-600 dark:text-gray-400">Top selling products</p>
                              </div>
                            </div>
                          </div>
                        } />
                        
                        <Route path="settings" element={
                          <div className="p-8">
                            <h1 className="text-2xl font-bold mb-4">Business Settings</h1>
                            <p>Business account settings and preferences would go here.</p>
                            <div className="mt-6 space-y-4">
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                                <p className="text-gray-600 dark:text-gray-400">Update your business details</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Payment Settings</h3>
                                <p className="text-gray-600 dark:text-gray-400">Manage payment methods and billing</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                                <p className="text-gray-600 dark:text-gray-400">Configure notification preferences</p>
                              </div>
                            </div>
                          </div>
                        } />
                        
                        <Route path="help" element={
                          <div className="p-8">
                            <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
                            <p>Business support resources and documentation.</p>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">📚 Getting Started Guide</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Learn how to use the platform effectively</p>
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium">Read Guide →</button>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-2">💬 Contact Support</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Get help from our support team</p>
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium">Contact Us →</button>
                              </div>
                            </div>
                          </div>
                        } />
                        
                        <Route path="*" element={<Navigate to="/business" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Fallback route - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;