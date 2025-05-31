// src/utils/accessControl.js - Updated to use Firestore permissions

/**
 * Check if user can manage products (add, edit, delete)
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canManageProducts = (user) => {
  if (!user) return false;
  return user.permissions?.canManageInventory === true;
};

/**
 * Check if user can view all orders (not just their own)
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canViewAllOrders = (user) => {
  if (!user) return false;
  return user.permissions?.canViewAllOrders === true;
};

/**
 * Check if user can manage inventory
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canManageInventory = (user) => {
  if (!user) return false;
  return user.permissions?.canManageInventory === true;
};

/**
 * Check if user can approve other users
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canApproveUsers = (user) => {
  if (!user) return false;
  return user.permissions?.canApproveUsers === true;
};

/**
 * Check if user can manage users
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  if (!user) return false;
  return user.permissions?.canManageUsers === true;
};

/**
 * Check if user can access admin panel
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canAccessAdminPanel = (user) => {
  if (!user) return false;
  // Admin panel access typically for admins or users with manage users permission
  return user.accountType === 'admin' || user.permissions?.canManageUsers === true;
};

/**
 * Check if user can access manager panel
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canAccessManagerPanel = (user) => {
  if (!user) return false;
  // Manager panel for admins, managers, or users with inventory/user management permissions
  return user.accountType === 'admin' || 
         user.accountType === 'manager' || 
         user.permissions?.canManageInventory === true ||
         user.permissions?.canManageUsers === true;
};

/**
 * Check if user can create orders
 * @param {Object} user - User object from auth context
 * @returns {boolean}
 */
export const canCreateOrders = (user) => {
  if (!user) return false;
  return user.permissions?.canCreateOrders === true;
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
    // Orders - check canCreateOrders permission
    if (canCreateOrders(user)) {
      navItems.push(
        { name: 'Orders', path: '/orders', icon: '📦', available: true },
        { name: 'Create Order', path: '/create-order', icon: '➕', available: true }
      );
    } else {
      // Still show orders but read-only
      navItems.push(
        { name: 'My Orders', path: '/orders', icon: '📦', available: true }
      );
    }

    // Inventory management - check canManageInventory permission
    if (canManageInventory(user)) {
      navItems.push(
        { name: 'Inventory', path: '/inventory', icon: '📊', available: true },
        { name: 'Add Product', path: '/add-product', icon: '➕', available: true }
      );
    }

    // Manager panel - check manager access
    if (canAccessManagerPanel(user)) {
      navItems.push(
        { name: 'Manager Panel', path: '/manager', icon: '👔', available: true }
      );
    }

    // Admin panel - check admin access
    if (canAccessAdminPanel(user)) {
      navItems.push(
        { name: 'Admin Panel', path: '/admin', icon: '⚙️', available: true }
      );
    }

    // User management - check canApproveUsers or canManageUsers
    if (canApproveUsers(user) || canManageUsers(user)) {
      navItems.push(
        { name: 'User Management', path: '/admin/users', icon: '👥', available: true }
      );
    }
  }

  return navItems.filter(item => item.available);
};

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  MANAGE_PRODUCTS: 'canManageInventory',
  VIEW_ALL_ORDERS: 'canViewAllOrders',
  MANAGE_INVENTORY: 'canManageInventory',
  APPROVE_USERS: 'canApproveUsers',
  MANAGE_USERS: 'canManageUsers',
  ACCESS_ADMIN_PANEL: 'canAccessAdminPanel',
  ACCESS_MANAGER_PANEL: 'canAccessManagerPanel',
  CREATE_ORDERS: 'canCreateOrders',
  MANAGE_BUSINESS_SETTINGS: 'canManageBusinessSettings'
};

/**
 * Check permission by name using Firestore permissions
 * @param {Object} user - User object from auth context
 * @param {string} permission - Permission constant
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  
  switch (permission) {
    case PERMISSIONS.MANAGE_PRODUCTS:
    case PERMISSIONS.MANAGE_INVENTORY:
      return user.permissions.canManageInventory === true;
    case PERMISSIONS.VIEW_ALL_ORDERS:
      return user.permissions.canViewAllOrders === true;
    case PERMISSIONS.APPROVE_USERS:
      return user.permissions.canApproveUsers === true;
    case PERMISSIONS.MANAGE_USERS:
      return user.permissions.canManageUsers === true;
    case PERMISSIONS.CREATE_ORDERS:
      return user.permissions.canCreateOrders === true;
    case PERMISSIONS.ACCESS_ADMIN_PANEL:
      return canAccessAdminPanel(user);
    case PERMISSIONS.ACCESS_MANAGER_PANEL:
      return canAccessManagerPanel(user);
    case PERMISSIONS.MANAGE_BUSINESS_SETTINGS:
      return canManageBusinessSettings(user);
    default:
      return false;
  }
};

/**
 * Get permission summary for debugging
 * @param {Object} user - User object from auth context
 * @returns {Object} Permission summary
 */
export const getPermissionSummary = (user) => {
  if (!user) return { role: 'guest', permissions: {} };
  
  return {
    role: user.accountType || 'user',
    businessType: user.businessType || null,
    permissions: user.permissions || {},
    computedAccess: {
      canManageProducts: canManageProducts(user),
      canViewAllOrders: canViewAllOrders(user),
      canManageInventory: canManageInventory(user),
      canApproveUsers: canApproveUsers(user),
      canManageUsers: canManageUsers(user),
      canCreateOrders: canCreateOrders(user),
      canAccessAdminPanel: canAccessAdminPanel(user),
      canAccessManagerPanel: canAccessManagerPanel(user)
    }
  };
};

export default {
  canManageProducts,
  canViewAllOrders,
  canManageInventory,
  canApproveUsers,
  canManageUsers,
  canAccessAdminPanel,
  canAccessManagerPanel,
  canCreateOrders,
  canManageBusinessSettings,
  getUserAccessLevel,
  getAvailableNavItems,
  hasPermission,
  getPermissionSummary,
  PERMISSIONS
};