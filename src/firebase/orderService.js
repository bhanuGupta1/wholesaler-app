// src/firebase/orderService.js
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

// Create a new order with items subcollection
export const createOrder = async (orderData) => {
  try {
    // Extract items from order data
    const { items, ...orderDetails } = orderData;
    
    // Create order document
    const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderDetails,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: orderDetails.status || 'pending'
    });
    
    // Add items to subcollection
    if (items && items.length > 0) {
      for (const item of items) {
        await addDoc(collection(db, ORDERS_COLLECTION, orderRef.id, 'orderItems'), {
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity
        });
      }
    }
    
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
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
    
    // Get order items
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
