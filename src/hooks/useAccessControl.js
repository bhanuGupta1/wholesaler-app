// src/hooks/useAccessControl.js - UPDATED: Added cart and checkout permissions
import { useAuth } from './useAuth';
import {
  canManageProducts,
  canAccessInventory,
  canViewAllProducts,
  canViewAllOrders,
  canDeleteOrders,
  canManageInventory,
  canApproveUsers,
  canAccessAdminPanel,
  canAccessManagerPanel,
  canCreateOrders,
  canAccessCart,        // NEW
  canAccessCheckout,    // NEW
  canManageBusinessSettings,
  getUserAccessLevel,
  getAvailableNavItems,
  hasPermission,
  PERMISSIONS
} from '../utils/accessControl';

/**
 * Custom hook for checking user permissions
 * @returns {Object} Object containing permission checking functions and user info
 */
export const useAccessControl = () => {
  const { user } = useAuth();

  return {
    // User info
    user,
    userAccessLevel: getUserAccessLevel(user),
    availableNavItems: getAvailableNavItems(user),
    
    // Permission checkers
    canManageProducts: canManageProducts(user),
    canAccessInventory: canAccessInventory(user),
    canViewAllProducts: canViewAllProducts(user),
    canViewAllOrders: canViewAllOrders(user),
    canDeleteOrders: canDeleteOrders(user),
    canManageInventory: canManageInventory(user),
    canApproveUsers: canApproveUsers(user),
    canAccessAdminPanel: canAccessAdminPanel(user),
    canAccessManagerPanel: canAccessManagerPanel(user),
    canCreateOrders: canCreateOrders(user),
    canAccessCart: canAccessCart(user),           // NEW
    canAccessCheckout: canAccessCheckout(user),   // NEW
    canManageBusinessSettings: canManageBusinessSettings(user),
    
    // Generic permission checker
    hasPermission: (permission) => hasPermission(user, permission),
    
    // Permission constants for easy access
    PERMISSIONS,
    
    // User type helpers
    isAdmin: user?.accountType === 'admin',
    isManager: user?.accountType === 'manager',
    isBusiness: user?.accountType === 'business',
    isSeller: user?.accountType === 'business' && user?.businessType === 'seller',
    isBuyer: user?.accountType === 'business' && user?.businessType === 'buyer',
    isRegularUser: user?.accountType === 'user',
    isGuest: !user
  };
};

export default useAccessControl;