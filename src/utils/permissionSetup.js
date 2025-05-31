// src/utils/permissionSetup.js - Utility to set up default Firestore permissions

/**
 * Default permission templates for different user types
 */
export const PERMISSION_TEMPLATES = {
  admin: {
    canManageInventory: true,
    canApproveUsers: true,
    canCreateOrders: true,
    canManageUsers: true,
    canViewAllOrders: true
  },
  
  manager: {
    canManageInventory: true,
    canApproveUsers: true,
    canCreateOrders: true,
    canManageUsers: false,
    canViewAllOrders: true
  },
  
  business_seller: {
    canManageInventory: true,
    canApproveUsers: false,
    canCreateOrders: true,
    canManageUsers: false,
    canViewAllOrders: false
  },
  
  business_buyer: {
    canManageInventory: false,
    canApproveUsers: false,
    canCreateOrders: true,
    canManageUsers: false,
    canViewAllOrders: false
  },
  
  user: {
    canManageInventory: false,
    canApproveUsers: false,
    canCreateOrders: true,
    canManageUsers: false,
    canViewAllOrders: false
  }
};

/**
 * Get default permissions for a user type
 * @param {string} accountType - 'admin', 'manager', 'business', 'user'
 * @param {string} businessType - 'seller', 'buyer' (only for business accounts)
 * @returns {Object} Permission object for Firestore
 */
export const getDefaultPermissions = (accountType, businessType = null) => {
  switch (accountType) {
    case 'admin':
      return { ...PERMISSION_TEMPLATES.admin };
    
    case 'manager':
      return { ...PERMISSION_TEMPLATES.manager };
    
    case 'business':
      if (businessType === 'seller') {
        return { ...PERMISSION_TEMPLATES.business_seller };
      } else if (businessType === 'buyer') {
        return { ...PERMISSION_TEMPLATES.business_buyer };
      } else {
        // Default business permissions (buyer)
        return { ...PERMISSION_TEMPLATES.business_buyer };
      }
    
    case 'user':
    default:
      return { ...PERMISSION_TEMPLATES.user };
  }
};

/**
 * Create custom permissions by combining templates
 * @param {string} baseTemplate - Base template to start with
 * @param {Object} overrides - Specific permissions to override
 * @returns {Object} Custom permission object
 */
export const createCustomPermissions = (baseTemplate, overrides = {}) => {
  const basePerms = PERMISSION_TEMPLATES[baseTemplate] || PERMISSION_TEMPLATES.user;
  return {
    ...basePerms,
    ...overrides
  };
};

/**
 * Validate permission object structure
 * @param {Object} permissions - Permission object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePermissions = (permissions) => {
  const requiredFields = [
    'canManageInventory',
    'canApproveUsers', 
    'canCreateOrders',
    'canManageUsers',
    'canViewAllOrders'
  ];
  
  if (!permissions || typeof permissions !== 'object') {
    return false;
  }
  
  // Check if all required fields exist and are booleans
  return requiredFields.every(field => 
    permissions.hasOwnProperty(field) && 
    typeof permissions[field] === 'boolean'
  );
};

/**
 * Example usage in user registration/creation:
 * 
 * // When creating a new user
 * const userPermissions = getDefaultPermissions('business', 'seller');
 * 
 * // When updating user document in Firestore
 * await updateDoc(userRef, {
 *   accountType: 'business',
 *   businessType: 'seller',
 *   permissions: userPermissions,
 *   // ... other user data
 * });
 * 
 * // Creating custom permissions
 * const customPerms = createCustomPermissions('user', {
 *   canCreateOrders: false, // Restrict this specific user
 *   canManageInventory: true // Give them special access
 * });
 */

export default {
  PERMISSION_TEMPLATES,
  getDefaultPermissions,
  createCustomPermissions,
  validatePermissions
};