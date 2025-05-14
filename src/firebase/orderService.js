// This is src/firebase/orderService.js file.
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

// Here I Create a new order with items subcollection
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
    
    // Add items to subcollection in the order collection.
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

// here I will get all the order items
export const getOrderWithItems = async (orderId) => {
  try {
    // Here i will get order document
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (!orderDoc.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    // Here I will get order from the customer.
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
    
    // Here I will return all the data as single.
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
// Here I will update order by firebase database.
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

// here i am will update order status.
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

// Here I will pagination and filtering to get a order.
export const getOrders = async (options = {}) => {
  try {
    let ordersQuery = collection(db, ORDERS_COLLECTION);
    const constraints = [];
    
    // Here I have applied filtering.
    if (options.status && options.status !== 'all') {
      constraints.push(where('status', '==', options.status));
    }
    
    if (options.customerEmail) {
      constraints.push(where('customerEmail', '==', options.customerEmail));
    }
    
    // Then apply sorting
    constraints.push(orderBy('createdAt', 'desc'));
    
    // After that apply pagination
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    // Then run query 
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

// Here I get recent orders
export const getRecentOrders = async (count = 5) => {
  return getOrders({ limit: count });
};
