// src/context/CartContext.jsx - Enhanced with more functionality
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('wholesaler-cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wholesaler-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p =>
          p.id === product.id 
            ? { ...p, quantity: Math.min(p.quantity + quantity, product.stock) }
            : p
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prev => prev.map(p => {
      if (p.id === id) {
        // Ensure we don't exceed stock
        const maxQuantity = p.stock || 999;
        return { ...p, quantity: Math.min(newQuantity, maxQuantity) };
      }
      return p;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  const getCartItem = (productId) => {
    return cart.find(item => item.id === productId);
  };

  // Validate cart items against current stock (useful for checking before checkout)
  const validateCartStock = async (products) => {
    const invalidItems = [];
    
    for (const cartItem of cart) {
      const currentProduct = products.find(p => p.id === cartItem.id);
      if (!currentProduct) {
        invalidItems.push({
          ...cartItem,
          issue: 'Product no longer available'
        });
      } else if (cartItem.quantity > currentProduct.stock) {
        invalidItems.push({
          ...cartItem,
          issue: `Only ${currentProduct.stock} items available`,
          maxAvailable: currentProduct.stock
        });
      }
    }
    
    return invalidItems;
  };

  // Auto-fix cart quantities based on current stock
  const fixCartQuantities = (products) => {
    setCart(prev => {
      return prev.map(cartItem => {
        const currentProduct = products.find(p => p.id === cartItem.id);
        if (currentProduct && cartItem.quantity > currentProduct.stock) {
          return {
            ...cartItem,
            quantity: Math.max(1, currentProduct.stock)
          };
        }
        return cartItem;
      }).filter(cartItem => {
        // Remove items that are no longer available
        const currentProduct = products.find(p => p.id === cartItem.id);
        return currentProduct && currentProduct.stock > 0;
      });
    });
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItem,
    validateCartStock,
    fixCartQuantities
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;