// src/context/CartContext.jsx - FIXED: User-specific cart persistence
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // Get current user
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate user-specific cart key
  const getCartKey = (userId) => {
    if (!userId) return "wholesaler-cart-guest";
    return `wholesaler-cart-${userId}`;
  };

  // Load cart from localStorage for specific user
  const loadUserCart = (userId) => {
    try {
      setIsLoading(true);
      const cartKey = getCartKey(userId);
      const savedCart = localStorage.getItem(cartKey);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } else {
        setCart([]); // Empty cart for new user/guest
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setCart([]); // Fallback to empty cart
    } finally {
      setIsLoading(false);
    }
  };

  // Save cart to localStorage for specific user
  const saveUserCart = (userId, cartData) => {
    try {
      const cartKey = getCartKey(userId);
      localStorage.setItem(cartKey, JSON.stringify(cartData));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  };

  // Clear old guest cart when user logs in
  const clearGuestCart = () => {
    try {
      localStorage.removeItem("wholesaler-cart-guest");
      localStorage.removeItem("wholesaler-cart"); // Legacy key cleanup
    } catch (error) {
      console.error("Error clearing guest cart:", error);
    }
  };

  // Load cart when user changes (login/logout/switch user)
  useEffect(() => {
    loadUserCart(user?.uid);

    // If user just logged in, clear any guest cart
    if (user?.uid) {
      clearGuestCart();
    }
  }, [user?.uid]);

  // Save cart whenever it changes (but not during initial load)
  useEffect(() => {
    if (!isLoading) {
      saveUserCart(user?.uid, cart);
    }
  }, [cart, user?.uid, isLoading]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: Math.min(p.quantity + quantity, product.stock) }
            : p,
        );
      }
      return [
        ...prev,
        { ...product, quantity: Math.min(quantity, product.stock) },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          // Ensure we don't exceed stock
          const maxQuantity = p.stock || 999;
          return { ...p, quantity: Math.min(newQuantity, maxQuantity) };
        }
        return p;
      }),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Transfer guest cart to user cart when they log in
  const transferGuestCart = async () => {
    try {
      const guestCart = localStorage.getItem("wholesaler-cart-guest");
      if (guestCart && user?.uid) {
        const parsedGuestCart = JSON.parse(guestCart);
        if (parsedGuestCart.length > 0) {
          // Merge with existing user cart if any
          setCart((prev) => {
            const merged = [...prev];
            parsedGuestCart.forEach((guestItem) => {
              const existing = merged.find((item) => item.id === guestItem.id);
              if (existing) {
                // Update quantity if item already exists
                existing.quantity = Math.min(
                  existing.quantity + guestItem.quantity,
                  guestItem.stock || 999,
                );
              } else {
                // Add new item
                merged.push(guestItem);
              }
            });
            return merged;
          });

          // Clear guest cart after transfer
          clearGuestCart();
        }
      }
    } catch (error) {
      console.error("Error transferring guest cart:", error);
    }
  };

  // Call transfer when user logs in
  useEffect(() => {
    if (user?.uid) {
      transferGuestCart();
    }
  }, [user?.uid]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return cart.some((item) => item.id === productId);
  };

  const getCartItem = (productId) => {
    return cart.find((item) => item.id === productId);
  };

  // Validate cart items against current stock (useful for checking before checkout)
  const validateCartStock = async (products) => {
    const invalidItems = [];

    for (const cartItem of cart) {
      const currentProduct = products.find((p) => p.id === cartItem.id);
      if (!currentProduct) {
        invalidItems.push({
          ...cartItem,
          issue: "Product no longer available",
        });
      } else if (cartItem.quantity > currentProduct.stock) {
        invalidItems.push({
          ...cartItem,
          issue: `Only ${currentProduct.stock} items available`,
          maxAvailable: currentProduct.stock,
        });
      }
    }

    return invalidItems;
  };

  // Auto-fix cart quantities based on current stock
  const fixCartQuantities = (products) => {
    setCart((prev) => {
      return prev
        .map((cartItem) => {
          const currentProduct = products.find((p) => p.id === cartItem.id);
          if (currentProduct && cartItem.quantity > currentProduct.stock) {
            return {
              ...cartItem,
              quantity: Math.max(1, currentProduct.stock),
            };
          }
          return cartItem;
        })
        .filter((cartItem) => {
          // Remove items that are no longer available
          const currentProduct = products.find((p) => p.id === cartItem.id);
          return currentProduct && currentProduct.stock > 0;
        });
    });
  };

  // Get cart info for debugging
  const getCartInfo = () => {
    return {
      userId: user?.uid || "guest",
      cartKey: getCartKey(user?.uid),
      itemCount: cart.length,
      total: getCartTotal(),
      isLoading,
    };
  };

  const value = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItem,
    validateCartStock,
    fixCartQuantities,
    transferGuestCart,
    getCartInfo, // For debugging
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartProvider;
