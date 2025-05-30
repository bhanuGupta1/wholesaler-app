// src/hooks/useAccessControl.js - Custom hook for access control
import { useAuth } from './useAuth';
import {
  canManageProducts,
  canViewAllOrders,
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
    canViewAllOrders: canViewAllOrders(user),
    canManageInventory: canManageInventory(user),
    canApproveUsers: canApproveUsers(user),
    canAccessAdminPanel: canAccessAdminPanel(user),
    canAccessManagerPanel: canAccessManagerPanel(user),
    canCreateOrders: canCreateOrders(user),
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