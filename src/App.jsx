// src/App.jsx - Enhanced with AddProduct, comprehensive nested routing, and role-based access control
// Key Features:
// • AddProduct route with ImageUploader integration and bulk pricing
// • Enhanced Business Panel with buyer/seller differentiation and nested routing
// • Comprehensive Manager Panel with analytics, reports, and settings
// • Role-based access control with permission-based routing
// • Support for seller upgrade workflow and business account types
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ProtectedRoute from './components/common/ProtectedRoute';

import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Documentation from './pages/Documentation';

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


// Admin components
const UserApprovalDashboard = lazy(() => import('./pages/admin/UserApprovalDashboard'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));

// User-specific components
const UserSpecificOrders = lazy(() => import('./components/UserSpecificOrders'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

function App() {
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

                {/* Shopping routes - accessible by all */}
                <Route path="/cart" element={
                  <Layout>
                    <Cart />
                  </Layout>
                } />

                <Route path="/checkout" element={
                  <Layout>
                    <Checkout />
                  </Layout>
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

                {/* Inventory routes - Admin, Manager, and Sellers can manage inventory */}
                <Route path="/inventory" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'business']}>
                    <Layout>
                      <Inventory />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory/:id" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'business']}>
                    <Layout>
                      <ProductDetail />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Add Product route - Admin, Manager, and Sellers can add products */}
                <Route path="/add-product" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'business']}>
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
                
                <Route path="/create-order" element={
                  <ProtectedRoute requiredPermission="canCreateOrders">
                    <Layout>
                      <CreateOrder />
                    </Layout>
                  </ProtectedRoute>
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
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Processing</h3>
                                    <p className="text-gray-600 dark:text-gray-400">View and process orders</p>
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
                                  <div className="text-3xl mr-4">⚙️</div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
                                    <p className="text-gray-600 dark:text-gray-400">System configuration</p>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        } />
                        
                        <Route path="users" element={<UserApprovalDashboard />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="orders" element={<UserSpecificOrders />} />
                        
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

                {/* Business-specific routes - Enhanced with nested routing */}
                <Route path="/business/*" element={
                  <ProtectedRoute requiredRole="business">
                    <Layout>
                      <Routes>
                        <Route index element={<BusinessDashboard />} />
                        
                        {/* Seller-specific routes */}
                        <Route path="products" element={
                          <ProtectedRoute allowedRoles={['admin', 'manager', 'business']}>
                            <Inventory />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="add-product" element={
                          <ProtectedRoute allowedRoles={['admin', 'manager', 'business']}>
                            <AddProduct />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="orders" element={
                          <UserSpecificOrders />
                        } />
                        
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