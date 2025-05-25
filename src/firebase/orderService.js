// src/firebase/orderService.js - Enhanced Order Service
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
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

// Create a new order with automatic stock management
export const createOrderWithStockUpdate = async (orderData) => {
  try {
    // Create a batch write for atomic transaction
    const batch = writeBatch(db);
    
    // Extract items from order data
    const { items, ...orderDetails } = orderData;
    
    // Validate stock availability before creating order
    for (const item of items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        throw new Error(`Product ${item.productName} not found`);
      }
      
      const productData = productSnap.data();
      if (productData.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productName}. Available: ${productData.stock}, Requested: ${item.quantity}`);
      }
    }
    
    // Create order document
    const orderRef = doc(collection(db, ORDERS_COLLECTION));
    batch.set(orderRef, {
      ...orderDetails,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: orderDetails.status || 'pending',
      paymentStatus: orderDetails.paymentStatus || 'pending'
    });
    
    // Update product stock
    for (const item of items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      batch.update(productRef, {
        stock: increment(-item.quantity),
        updatedAt: serverTimestamp()
      });
    }
    
    // Add order items as subcollection
    for (const item of items) {
      const itemRef = doc(collection(db, ORDERS_COLLECTION, orderRef.id, 'orderItems'));
      batch.set(itemRef, {
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      });
    }
    
    // Commit the batch
    await batch.commit();
    
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order with stock update:', error);
    throw error;
  }
};

// Get order with items
export const getOrderWithItems = async (orderId) => {
  try {
    // Get order document
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    // Get order items from subcollection
    const itemsQuery = query(
      collection(db, ORDERS_COLLECTION, orderId, 'orderItems')
    );
    
    const itemsSnapshot = await getDocs(itemsQuery);
    const items = [];
    
    itemsSnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Return combined data
    return {
      id: orderDoc.id,
      ...orderDoc.data(),
      items
    };
  } catch (error) {
    console.error('Error getting order with items:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, paymentStatus = null) => {
  try {
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get orders with filtering and pagination
export const getOrders = async (options = {}) => {
  try {
    let ordersQuery = collection(db, ORDERS_COLLECTION);
    const constraints = [];
    
    // Apply filtering
    if (options.status && options.status !== 'all') {
      constraints.push(where('status', '==', options.status));
    }
    
    if (options.userId) {
      constraints.push(where('userId', '==', options.userId));
    }
    
    if (options.userRole) {
      constraints.push(where('userRole', '==', options.userRole));
    }
    
    // Apply sorting
    constraints.push(orderBy('createdAt', 'desc'));
    
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
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
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
      ordersQuery = query(ordersQuery, where('userId', '==', userId));
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
      
      if (data.status === 'pending') pendingOrders++;
      if (data.status === 'completed') completedOrders++;
    });
    
    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  } catch (error) {
    console.error('Error getting order statistics:', error);
    throw error;
  }
};

// Cancel order and restore stock
export const cancelOrder = async (orderId) => {
  try {
    // Get order with items
    const order = await getOrderWithItems(orderId);
    
    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }
    
    if (order.status === 'completed' || order.status === 'shipped') {
      throw new Error('Cannot cancel completed or shipped orders');
    }
    
    // Create batch for atomic operation
    const batch = writeBatch(db);
    
    // Update order status
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    batch.update(orderRef, {
      status: 'cancelled',
      paymentStatus: 'refunded',
      updatedAt: serverTimestamp()
    });
    
    // Restore product stock
    for (const item of order.items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      batch.update(productRef, {
        stock: increment(item.quantity),
        updatedAt: serverTimestamp()
      });
    }
    
    // Commit the batch
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
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
    return orders.filter(order => 
      (order.customerName && order.customerName.toLowerCase().includes(term)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(term)) ||
      (order.id && order.id.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error('Error searching orders:', error);
    throw error;
  }
};

// Get orders by date range
export const getOrdersByDateRange = async (startDate, endDate, options = {}) => {
  try {
    let ordersQuery = collection(db, ORDERS_COLLECTION);
    const constraints = [];
    
    // Add date range constraints
    if (startDate) {
      constraints.push(where('createdAt', '>=', startDate));
    }
    if (endDate) {
      constraints.push(where('createdAt', '<=', endDate));
    }
    
    // Add other filters
    if (options.status && options.status !== 'all') {
      constraints.push(where('status', '==', options.status));
    }
    
    if (options.userId) {
      constraints.push(where('userId', '==', options.userId));
    }
    
    // Add sorting
    constraints.push(orderBy('createdAt', 'desc'));
    
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
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders by date range:', error);
    throw error;
  }
};

// Export all functions
export default {
  createOrderWithStockUpdate,
  getOrderWithItems,
  updateOrderStatus,
  getOrders,
  getRecentOrders,
  getOrderStatistics,
  cancelOrder,
  searchOrders,
  getOrdersByDateRange
};