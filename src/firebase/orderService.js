// src/firebase/orderService.js - Fixed Order Service with Bulk Pricing Support
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

// Create a new order with automatic stock management
export const createOrderWithStockUpdate = async (orderData) => {
  try {
    // Create a batch write for atomic transaction
    const batch = writeBatch(db);

    // Extract items from order data
    const { items, ...orderDetails } = orderData;

    // Validate items before proceeding
    validateOrderItems(items);

    // Calculate subtotal from items using the effective price (handles bulk pricing)
    const subtotal = items.reduce((total, item) => {
      // Use effectivePrice if available (for bulk pricing), otherwise use price
      const itemPrice = item.effectivePrice ?? item.price ?? 0;
      return total + itemPrice * (item.quantity ?? 0);
    }, 0);

    // Use provided totals if available, otherwise calculate
    const taxAmount =
      orderDetails.taxAmount ?? orderDetails.gst ?? subtotal * 0.15; // 15% GST for NZ
    const finalTotal =
      orderDetails.totalAmount ?? orderDetails.total ?? subtotal + taxAmount;

    // Validate stock availability before creating order
    for (const item of items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error(`Product ${item.productName} not found`);
      }

      const productData = productSnap.data();
      if (productData.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productName}. Available: ${productData.stock}, Requested: ${item.quantity}`,
        );
      }
    }

    // Create order document with both createdAt and dateCreated for compatibility
    const orderRef = doc(collection(db, ORDERS_COLLECTION));
    const timestamp = serverTimestamp();

    batch.set(orderRef, {
      ...orderDetails,
      subtotal: orderDetails.subtotal ?? subtotal,
      taxAmount: orderDetails.taxAmount ?? orderDetails.gst ?? taxAmount,
      totalAmount: orderDetails.totalAmount ?? orderDetails.total ?? finalTotal,
      total: orderDetails.total ?? orderDetails.totalAmount ?? finalTotal, // Keep both for compatibility
      createdAt: timestamp,
      dateCreated: timestamp, // Added for compatibility with OrderDetails component
      updatedAt: timestamp,
      status: orderDetails.status || "pending",
      paymentStatus: orderDetails.paymentStatus || "pending",
    });

    // Update product stock
    for (const item of items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      batch.update(productRef, {
        stock: increment(-item.quantity),
        updatedAt: timestamp,
      });
    }

    // Add order items as subcollection - FIXED: Handle undefined price values
    for (const item of items) {
      const itemRef = doc(
        collection(db, ORDERS_COLLECTION, orderRef.id, "orderItems"),
      );

      // Use effectivePrice if available (for bulk pricing), otherwise use price, default to 0
      const itemPrice = item.effectivePrice ?? item.price ?? 0;
      const originalPrice = item.price ?? 0;
      const itemQuantity = item.quantity ?? 0;

      // Ensure all values are valid (not undefined)
      batch.set(itemRef, {
        productId: item.productId || "",
        productName: item.productName || "",
        price: originalPrice, // Original price before any discounts
        effectivePrice: itemPrice, // Price after bulk discounts
        quantity: itemQuantity,
        subtotal: itemPrice * itemQuantity,
        // Include bulk pricing info if available
        hasBulkDiscount: item.hasBulkDiscount ?? false,
        ...(item.hasBulkDiscount && {
          originalPrice: originalPrice,
          bulkSavings: (originalPrice - itemPrice) * itemQuantity,
          bulkPricingInfo: item.bulkPricing || null,
        }),
        // Additional item metadata
        sku: item.sku || "",
        category: item.category || "",
        imageUrl: item.imageUrl || "",
      });
    }

    // Commit the batch
    await batch.commit();

    return orderRef.id;
  } catch (error) {
    console.error("Error creating order with stock update:", error);
    throw error;
  }
};

// Additional helper function to validate item data before order creation
export const validateOrderItems = (items) => {
  const errors = [];

  if (!items || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  items.forEach((item, index) => {
    // Check for required fields
    if (!item.productId) {
      errors.push(`Item ${index + 1}: Missing product ID`);
    }

    if (!item.productName) {
      errors.push(`Item ${index + 1}: Missing product name`);
    }

    // Check price - should not be undefined, null, or negative
    const itemPrice = item.effectivePrice ?? item.price;
    if (itemPrice === undefined || itemPrice === null || itemPrice < 0) {
      errors.push(`Item ${index + 1} (${item.productName}): Invalid price`);
    }

    // Check quantity
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1} (${item.productName}): Invalid quantity`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Order validation failed:\n${errors.join("\n")}`);
  }

  return true;
};

// Enhanced create order function with validation
export const createValidatedOrder = async (orderData) => {
  try {
    // Validate items before proceeding
    validateOrderItems(orderData.items);

    // Proceed with order creation
    return await createOrderWithStockUpdate(orderData);
  } catch (error) {
    console.error("Error creating validated order:", error);
    throw error;
  }
};

// FIXED: Get order with items
export const getOrderWithItems = async (orderId) => {
  try {
    // Get order document
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));

    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const orderData = orderDoc.data();

    // Get order items from subcollection
    const itemsQuery = query(
      collection(db, ORDERS_COLLECTION, orderId, "orderItems"),
      orderBy("productName", "asc"),
    );

    const itemsSnapshot = await getDocs(itemsQuery);
    const items = [];

    itemsSnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      id: orderDoc.id,
      ...orderData,
      items,
      // Ensure we have totals with proper field names
      totalAmount: orderData.totalAmount || orderData.total || 0,
      total: orderData.total || orderData.totalAmount || 0,
    };
  } catch (error) {
    console.error("Error getting order with items:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId,
  status,
  paymentStatus = null,
) => {
  try {
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Get orders with filtering and pagination
export const getOrders = async (options = {}) => {
  try {
    let ordersQuery = collection(db, ORDERS_COLLECTION);
    const constraints = [];

    // Apply filtering
    if (options.status && options.status !== "all") {
      constraints.push(where("status", "==", options.status));
    }

    if (options.userId) {
      constraints.push(where("userId", "==", options.userId));
    }

    if (options.userRole) {
      constraints.push(where("userRole", "==", options.userRole));
    }

    // Apply sorting
    constraints.push(orderBy("createdAt", "desc"));

    // Apply pagination
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Execute query
    if (constraints.length > 0) {
      ordersQuery = query(ordersQuery, ...constraints);
    }

    const snapshot = await getDocs(ordersQuery);

    const orders = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        // Ensure compatibility with both totalAmount and total fields
        totalAmount: data.totalAmount || data.total || 0,
        total: data.total || data.totalAmount || 0,
      });
    });

    return orders;
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

// Get recent orders for dashboard
export const getRecentOrders = async (count = 5, userId = null) => {
  const options = { limit: count };
  if (userId) {
    options.userId = userId;
  }
  return getOrders(options);
};

// Calculate order statistics
export const getOrderStatistics = async (userId = null) => {
  try {
    let ordersQuery = collection(db, ORDERS_COLLECTION);

    if (userId) {
      ordersQuery = query(ordersQuery, where("userId", "==", userId));
    }

    const snapshot = await getDocs(ordersQuery);

    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalOrders++;
      totalRevenue += data.total || 0;

      if (data.status === "pending") pendingOrders++;
      if (data.status === "completed") completedOrders++;
    });

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  } catch (error) {
    console.error("Error getting order statistics:", error);
    throw error;
  }
};

// Cancel order and restore stock
export const cancelOrder = async (orderId) => {
  try {
    // Get order with items
    const order = await getOrderWithItems(orderId);

    if (order.status === "cancelled") {
      throw new Error("Order is already cancelled");
    }

    if (order.status === "completed" || order.status === "shipped") {
      throw new Error("Cannot cancel completed or shipped orders");
    }

    // Create batch for atomic operation
    const batch = writeBatch(db);

    // Update order status
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    batch.update(orderRef, {
      status: "cancelled",
      paymentStatus: "refunded",
      updatedAt: serverTimestamp(),
    });

    // Restore product stock
    for (const item of order.items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      batch.update(productRef, {
        stock: increment(item.quantity),
        updatedAt: serverTimestamp(),
      });
    }

    // Commit the batch
    await batch.commit();

    return true;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

// Search orders
export const searchOrders = async (searchTerm, options = {}) => {
  try {
    // Note: Firestore doesn't support full-text search
    // This is a basic search implementation
    const orders = await getOrders(options);

    if (!searchTerm) return orders;

    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        (order.customerName &&
          order.customerName.toLowerCase().includes(term)) ||
        (order.customerEmail &&
          order.customerEmail.toLowerCase().includes(term)) ||
        (order.id && order.id.toLowerCase().includes(term)),
    );
  } catch (error) {
    console.error("Error searching orders:", error);
    throw error;
  }
};

// Get orders by date range
export const getOrdersByDateRange = async (
  startDate,
  endDate,
  options = {},
) => {
  try {
    let ordersQuery = collection(db, ORDERS_COLLECTION);
    const constraints = [];

    // Add date range constraints
    if (startDate) {
      constraints.push(where("createdAt", ">=", startDate));
    }
    if (endDate) {
      constraints.push(where("createdAt", "<=", endDate));
    }

    // Add other filters
    if (options.status && options.status !== "all") {
      constraints.push(where("status", "==", options.status));
    }

    if (options.userId) {
      constraints.push(where("userId", "==", options.userId));
    }

    // Add sorting
    constraints.push(orderBy("createdAt", "desc"));

    // Add limit if specified
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Execute query
    if (constraints.length > 0) {
      ordersQuery = query(ordersQuery, ...constraints);
    }

    const snapshot = await getDocs(ordersQuery);
    const orders = [];

    snapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return orders;
  } catch (error) {
    console.error("Error getting orders by date range:", error);
    throw error;
  }
};

// Utility function to calculate order totals from items (useful for validation)
export const calculateOrderTotals = (items, options = {}) => {
  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.effectivePrice ?? item.price ?? 0;
    return total + itemPrice * (item.quantity ?? 0);
  }, 0);

  const taxRate = options.taxRate ?? 0.15; // Default to 15% GST
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Calculate savings if bulk pricing is applied
  const originalSubtotal = items.reduce((total, item) => {
    const originalPrice = item.price ?? 0;
    return total + originalPrice * (item.quantity ?? 0);
  }, 0);

  const savings = originalSubtotal - subtotal;

  return {
    subtotal,
    originalSubtotal,
    savings,
    taxAmount,
    total,
    itemCount: items.reduce((count, item) => count + (item.quantity ?? 0), 0),
    hasBulkDiscount: savings > 0,
  };
};

// Export all functions
export default {
  createOrderWithStockUpdate,
  createValidatedOrder,
  validateOrderItems,
  calculateOrderTotals,
  getOrderWithItems,
  updateOrderStatus,
  getOrders,
  getRecentOrders,
  getOrderStatistics,
  cancelOrder,
  searchOrders,
  getOrdersByDateRange,
};
