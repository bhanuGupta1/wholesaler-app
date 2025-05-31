// src/hooks/useAccessControl.js - Updated to use Firestore permissions
import { useAuth } from './useAuth';
import {
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
} from '../utils/accessControl';

/**
 * Custom hook for checking user permissions using Firestore permissions
 * @returns {Object} Object containing permission checking functions and user info
 */
export const useAccessControl = () => {
  const { user } = useAuth();

  return {
    // User info
    user,
    userAccessLevel: getUserAccessLevel(user),
    availableNavItems: getAvailableNavItems(user),
    
    // Firestore permission readers
    canManageProducts: canManageProducts(user),
    canViewAllOrders: canViewAllOrders(user),
    canManageInventory: canManageInventory(user),
    canApproveUsers: canApproveUsers(user),
    canManageUsers: canManageUsers(user),
    canAccessAdminPanel: canAccessAdminPanel(user),
    canAccessManagerPanel: canAccessManagerPanel(user),
    canCreateOrders: canCreateOrders(user),
    canManageBusinessSettings: canManageBusinessSettings(user),
    
    // Generic permission checker
    hasPermission: (permission) => hasPermission(user, permission),
    
    // Permission constants for easy access
    PERMISSIONS,
    
    // User type helpers (still useful for UI logic)
    isAdmin: user?.accountType === 'admin',
    isManager: user?.accountType === 'manager',
    isBusiness: user?.accountType === 'business',
    isSeller: user?.accountType === 'business' && user?.businessType === 'seller',
    isBuyer: user?.accountType === 'business' && user?.businessType === 'buyer',
    isRegularUser: user?.accountType === 'user',
    isGuest: !user,
    
    // Raw Firestore permissions (for debugging)
    firestorePermissions: user?.permissions || {},
    
    // Debug helper
    permissionSummary: getPermissionSummary(user)
  };
};

export default useAccessControl;

// Example usage in AddProduct component:
/*
import { useAccessControl } from '../hooks/useAccessControl';

const AddProduct = () => {
  const { canManageProducts, userAccessLevel } = useAccessControl();
  
  if (!canManageProducts) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-500">
          You need seller, manager, or admin permissions to add products.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Current access level: {userAccessLevel}
        </p>
      </div>
    );
  }
  
  // Rest of your component...
  return <div>Add Product Form</div>;
};
*/