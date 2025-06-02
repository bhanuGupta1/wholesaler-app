// src/utils/accessControl.js - FIXED: Explicit seller access to inventory

/**
 * Check if user can access inventory
 * ALLOWS: Admin, Manager, Business Sellers
 * BLOCKS: Business Buyers only
 */
export const canAccessInventory = (user) => {
  if (!user) return false;
  
  // Explicitly block ONLY business buyers
  if (user.accountType === 'business' && user.businessType === 'buyer') {
    return false;
  }
  
  // Allow everyone else: admin, manager, business sellers, regular users
  return true;
};

/**
 * Check if user can manage products (add, edit, delete)
 * Same logic as inventory access
 */
export const canManageProducts = (user) => {
  return canAccessInventory(user);
};

/**
 * Check if user can view all products (not just their own)
 * Only admins and managers can see all products
 */
export const canViewAllProducts = (user) => {
  if (!user) return false;
  
  return user.accountType === 'admin' || user.accountType === 'manager';
};

/**
 * Check if user should see only their own products
 * Business sellers see only their products
 */
export const shouldFilterByOwnership = (user) => {
  if (!user) return false;
  
  return user.accountType === 'business' && user.businessType === 'seller';
};

/**
 * Check if user can view all orders (not just their own)
 */
export const canViewAllOrders = (user) => {
  if (!user) return false;
  
  return user.accountType === 'admin' || user.accountType === 'manager';
};

/**
 * Check if user can delete orders
 */
export const canDeleteOrders = (user) => {
  if (!user) return false;
  
  return user.accountType === 'admin' || user.accountType === 'manager';
};

/**
 * Check if user can manage inventory
 * Same as canAccessInventory
 */
export const canManageInventory = (user) => {
  return canAccessInventory(user);
};

/**
 * Check if user can approve other users
 */
export const canApproveUsers = (user) => {
  if (!user) return false;
  
  return user.accountType === 'admin' || user.accountType === 'manager';
};

/**
 * Check if user can access admin panel
 */
export const canAccessAdminPanel = (user) => {
  if (!user) return false;
  
  return user.accountType === 'admin';
};

/**
 * Check if user can access manager panel
 */
export const canAccessManagerPanel = (user) => {
  if (!user) return false;
  
  return user.accountType === 'admin' || user.accountType === 'manager';
};

/**
 * Check if user can create orders
 */
export const canCreateOrders = (user) => {
  if (!user) return false;
  
  // All authenticated users can create orders
  return true;
};

/**
 * Check if user can manage their own business settings
 */
export const canManageBusinessSettings = (user) => {
  if (!user) return false;
  
  return user.accountType === 'admin' || 
         user.accountType === 'manager' || 
         user.accountType === 'business';
};

/**
 * Get user's access level for display purposes
 */
export const getUserAccessLevel = (user) => {
  if (!user) return 'Guest';
  
  if (user.accountType === 'admin') return 'Administrator';
  if (user.accountType === 'manager') return 'Manager';
  if (user.accountType === 'business') {
    if (user.businessType === 'seller') return 'Business Seller';
    if (user.businessType === 'buyer') return 'Business Buyer';
    return 'Business User';
  }
  
  return 'Regular User';
};

/**
 * Get appropriate redirect path for unauthorized access
 */
export const getUnauthorizedRedirect = (user) => {
  if (!user) return '/login';
  
  if (user.accountType === 'admin') return '/admin-dashboard';
  if (user.accountType === 'manager') return '/manager-dashboard';
  if (user.accountType === 'business') return '/business-dashboard';
  
  return '/user-dashboard';
};

/**
 * Get available navigation items based on user permissions
 */
export const getAvailableNavItems = (user) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: '🏠', available: true },
    { name: 'Catalog', path: '/catalog', icon: '📋', available: true },
    { name: 'Cart', path: '/cart', icon: '🛒', available: true }
  ];

  if (user) {
    navItems.push(
      { name: 'Orders', path: '/orders', icon: '📦', available: canCreateOrders(user) }
    );

    // Only show inventory/add product for users who can access inventory
    if (canAccessInventory(user)) {
      navItems.push(
        { name: 'Inventory', path: '/inventory', icon: '📊', available: true },
        { name: 'Add Product', path: '/add-product', icon: '➕', available: true }
      );
    }

    if (canAccessManagerPanel(user)) {
      navItems.push(
        { name: 'Manager Panel', path: '/manager', icon: '👔', available: true }
      );
    }

    if (canAccessAdminPanel(user)) {
      navItems.push(
        { name: 'Admin Panel', path: '/admin', icon: '⚙️', available: true }
      );
    }
  }

  return navItems.filter(item => item.available);
};

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  MANAGE_PRODUCTS: 'canManageProducts',
  ACCESS_INVENTORY: 'canAccessInventory',
  VIEW_ALL_PRODUCTS: 'canViewAllProducts',
  FILTER_BY_OWNERSHIP: 'shouldFilterByOwnership',
  VIEW_ALL_ORDERS: 'canViewAllOrders',
  DELETE_ORDERS: 'canDeleteOrders',
  MANAGE_INVENTORY: 'canManageInventory',
  APPROVE_USERS: 'canApproveUsers',
  ACCESS_ADMIN_PANEL: 'canAccessAdminPanel',
  ACCESS_MANAGER_PANEL: 'canAccessManagerPanel',
  CREATE_ORDERS: 'canCreateOrders',
  MANAGE_BUSINESS_SETTINGS: 'canManageBusinessSettings'
};

/**
 * Check permission by name
 */
export const hasPermission = (user, permission) => {
  switch (permission) {
    case PERMISSIONS.MANAGE_PRODUCTS:
      return canManageProducts(user);
    case PERMISSIONS.ACCESS_INVENTORY:
      return canAccessInventory(user);
    case PERMISSIONS.VIEW_ALL_PRODUCTS:
      return canViewAllProducts(user);
    case PERMISSIONS.FILTER_BY_OWNERSHIP:
      return shouldFilterByOwnership(user);
    case PERMISSIONS.VIEW_ALL_ORDERS:
      return canViewAllOrders(user);
    case PERMISSIONS.DELETE_ORDERS:
      return canDeleteOrders(user);
    case PERMISSIONS.MANAGE_INVENTORY:
      return canManageInventory(user);
    case PERMISSIONS.APPROVE_USERS:
      return canApproveUsers(user);
    case PERMISSIONS.ACCESS_ADMIN_PANEL:
      return canAccessAdminPanel(user);
    case PERMISSIONS.ACCESS_MANAGER_PANEL:
      return canAccessManagerPanel(user);
    case PERMISSIONS.CREATE_ORDERS:
      return canCreateOrders(user);
    case PERMISSIONS.MANAGE_BUSINESS_SETTINGS:
      return canManageBusinessSettings(user);
    default:
      return false;
  }
};

export default {
  canManageProducts,
  canAccessInventory,
  canViewAllProducts,
  shouldFilterByOwnership,
  canViewAllOrders,
  canDeleteOrders,
  canManageInventory,
  canApproveUsers,
  canAccessAdminPanel,
  canAccessManagerPanel,
  canCreateOrders,
  canManageBusinessSettings,
  getUserAccessLevel,
  getUnauthorizedRedirect,
  getAvailableNavItems,
  hasPermission,
  PERMISSIONS
};