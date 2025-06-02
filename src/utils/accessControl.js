// src/utils/accessControl.js - Fixed with canDeleteOrders permission

/**
 * Check if user can manage products (add, edit, delete)
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canManageProducts = (user) => {
  if (!user) return false;
  
  const isAdmin = user.accountType === 'admin';
  const isManager = user.accountType === 'manager';
  const isSeller = user.accountType === 'business' && user.businessType === 'seller';
  
  return isAdmin || isManager || isSeller;
};

/**
 * Check if user can view all orders (not just their own)
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canViewAllOrders = (user) => {
  if (!user) return false;
  
  const isAdmin = user.accountType === 'admin';
  const isManager = user.accountType === 'manager';
  
  return isAdmin || isManager;
};

/**
 * Check if user can delete orders
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canDeleteOrders = (user) => {
  if (!user) return false;
  
  const isAdmin = user.accountType === 'admin';
  const isManager = user.accountType === 'manager';
  
  return isAdmin || isManager;
};

/**
 * Check if user can manage inventory
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canManageInventory = (user) => {
  return canManageProducts(user); // Same permissions as product management
};

/**
 * Check if user can approve other users
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canApproveUsers = (user) => {
  if (!user) return false;
  
  const isAdmin = user.accountType === 'admin';
  const isManager = user.accountType === 'manager';
  
  return isAdmin || isManager;
};

/**
 * Check if user can access admin panel
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canAccessAdminPanel = (user) => {
  if (!user) return false;
  
  return user.accountType === 'admin';
};

/**
 * Check if user can access manager panel
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canAccessManagerPanel = (user) => {
  if (!user) return false;
  
  const isAdmin = user.accountType === 'admin';
  const isManager = user.accountType === 'manager';
  
  return isAdmin || isManager;
};

/**
 * Check if user can create orders
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canCreateOrders = (user) => {
  if (!user) return false;
  
  // All authenticated users can create orders
  return true;
};

/**
 * Check if user can manage their own business settings
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canManageBusinessSettings = (user) => {
  if (!user) return false;
  
  const isAdmin = user.accountType === 'admin';
  const isManager = user.accountType === 'manager';
  const isBusiness = user.accountType === 'business';
  
  return isAdmin || isManager || isBusiness;
};

/**
 * Get user's access level for display purposes
 * @param {Object} user - User object from auth context
 * @returns {string}
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
 * Get available navigation items based on user permissions
 * @param {Object} user - User object from auth context
 * @returns {Array} Array of navigation items
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

    if (canManageProducts(user)) {
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
 * @param {Object} user - User object from auth context
 * @param {string} permission - Permission constant
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  switch (permission) {
    case PERMISSIONS.MANAGE_PRODUCTS:
      return canManageProducts(user);
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
  canViewAllOrders,
  canDeleteOrders,
  canManageInventory,
  canApproveUsers,
  canAccessAdminPanel,
  canAccessManagerPanel,
  canCreateOrders,
  canManageBusinessSettings,
  getUserAccessLevel,
  getAvailableNavItems,
  hasPermission,
  PERMISSIONS
};