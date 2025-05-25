// src/firebase/orderService.js - CORRECTED VERSION
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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

const ORDERS_COLLECTION = 'orders';

// Create a new order with items stored in the main document
export const createOrder = async (orderData) => {
  try {
    // Extract items from order data
    const { items, ...orderDetails } = orderData;
    
    // Calculate totals from items
    const totalAmount = items ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    const itemCount = items ? items.length : 0;
    
    // Create order document with all necessary fields
    const orderDocData = {
      ...orderDetails,
      items: items || [],           // Store items directly in order document
      totalAmount: totalAmount,     // Calculated total
      itemCount: itemCount,         // Number of items
      total: totalAmount,           // Also store as 'total' for compatibility
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: orderDetails.status || 'pending'
    };
    
    // Create the main order document
    const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), orderDocData);
    
    // ALSO create items in subcollection for complex queries (optional)
    if (items && items.length > 0) {
      for (const item of items) {
        await addDoc(collection(db, ORDERS_COLLECTION, orderRef.id, 'orderItems'), {
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        });
      }
    }
    
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get order with items from the main document
export const getOrderWithItems = async (orderId) => {
  try {
    // Get order document
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    const orderData = orderDoc.data();
    
    // Return order data with items from the main document
    return {
      id: orderDoc.id,
      ...orderData,
      items: orderData.items || [],
      // Ensure we have totals
      totalAmount: orderData.totalAmount || orderData.total || 0,
      total: orderData.total || orderData.totalAmount || 0
    };
  } catch (error) {
    console.error('Error getting order with items:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (orderId, orderData) => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      ...orderData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get orders with pagination and filtering
export const getOrders = async (options = {}) => {
  try {
    let ordersQuery = collection(db, ORDERS_COLLECTION);
    const constraints = [];
    
    // Apply filtering
    if (options.status && options.status !== 'all') {
      constraints.push(where('status', '==', options.status));
    }
    
    if (options.customerEmail) {
      constraints.push(where('customerEmail', '==', options.customerEmail));
    }
    
    // Apply sorting
    constraints.push(orderBy('createdAt', 'desc'));
    
    // Apply pagination
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    // Build and execute query
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
        total: data.total || data.totalAmount || 0
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

// Get recent orders
export const getRecentOrders = async (count = 5) => {
  return getOrders({ limit: count });
};