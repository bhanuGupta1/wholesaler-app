// src/utils/seedDatabase.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Sample product data
const sampleProducts = [
  {
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 149.99,
    stock: 25,
    category: "Electronics",
    imageUrl: "https://example.com/headphones.jpg",
    sku: "WH-001"
  },
  {
    name: "Smart Watch",
    description: "Fitness and health tracking smartwatch",
    price: 199.99,
    stock: 18,
    category: "Electronics",
    imageUrl: "https://example.com/smartwatch.jpg",
    sku: "SW-002"
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof bluetooth speaker",
    price: 79.99,
    stock: 32,
    category: "Electronics",
    imageUrl: "https://example.com/speaker.jpg",
    sku: "BS-003"
  },
  {
    name: "Laptop Stand",
    description: "Adjustable aluminum laptop stand",
    price: 49.99,
    stock: 12,
    category: "Office Supplies",
    imageUrl: "https://example.com/laptopstand.jpg",
    sku: "LS-004"
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical gaming keyboard",
    price: 129.99,
    stock: 8,
    category: "Computer Accessories",
    imageUrl: "https://example.com/keyboard.jpg",
    sku: "KB-005"
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub adapter",
    price: 39.99,
    stock: 5,
    category: "Computer Accessories",
    imageUrl: "https://example.com/usbchub.jpg",
    sku: "UC-006"
  }
];

// Sample order data
const sampleOrders = [
  {
    customerName: "John Smith",
    email: "john.smith@example.com",
    total: 229.98,
    status: "completed",
    itemCount: 2,
    items: [
      { productId: 1, quantity: 1, price: 149.99, name: "Wireless Headphones" },
      { productId: 4, quantity: 1, price: 79.99, name: "Bluetooth Speaker" }
    ],
    shippingAddress: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62704",
      country: "USA"
    },
    paymentMethod: "Credit Card",
    createdAt: serverTimestamp()
  },
  {
    customerName: "Sarah Johnson",
    email: "sarah.j@example.com",
    total: 199.99,
    status: "shipped",
    itemCount: 1,
    items: [
      { productId: 2, quantity: 1, price: 199.99, name: "Smart Watch" }
    ],
    shippingAddress: {
      street: "456 Elm St",
      city: "Riverdale",
      state: "NY",
      zipCode: "10471",
      country: "USA"
    },
    paymentMethod: "PayPal",
    createdAt: serverTimestamp()
  },
  {
    customerName: "Michael Wong",
    email: "m.wong@example.com",
    total: 259.97,
    status: "pending",
    itemCount: 3,
    items: [
      { productId: 4, quantity: 1, price: 49.99, name: "Laptop Stand" },
      { productId: 5, quantity: 1, price: 129.99, name: "Mechanical Keyboard" },
      { productId: 6, quantity: 2, price: 39.99, name: "USB-C Hub" }
    ],
    shippingAddress: {
      street: "789 Oak Ave",
      city: "Portland",
      state: "OR",
      zipCode: "97205",
      country: "USA"
    },
    paymentMethod: "Credit Card",
    createdAt: serverTimestamp()
  }
];

// Sample activity data
const sampleActivities = [
  {
    type: "order",
    description: "New order #ORD-001 placed by John Smith",
    createdAt: serverTimestamp(),
    userId: "user123",
    details: {
      orderId: "ORD-001",
      total: 229.98
    }
  },
  {
    type: "inventory",
    description: "Stock updated for Mechanical Keyboard",
    createdAt: serverTimestamp(),
    userId: "admin456",
    details: {
      productId: "KB-005",
      oldStock: 5,
      newStock: 8
    }
  },
  {
    type: "order",
    description: "Order #ORD-002 status changed to shipped",
    createdAt: serverTimestamp(),
    userId: "admin456",
    details: {
      orderId: "ORD-002",
      oldStatus: "processing",
      newStatus: "shipped"
    }
  },
  {
    type: "order",
    description: "New order #ORD-003 placed by Michael Wong",
    createdAt: serverTimestamp(),
    userId: "user456",
    details: {
      orderId: "ORD-003",
      total: 259.97
    }
  },
  {
    type: "inventory",
    description: "Low stock alert: USB-C Hub (5 remaining)",
    createdAt: serverTimestamp(),
    userId: "system",
    details: {
      productId: "UC-006",
      stock: 5,
      threshold: 10
    }
  }
];

/**
 * Seeds the Firebase database with sample data for testing
 * @returns {Promise<object>} Object containing the results of seeding each collection
 */
export const seedDatabase = async () => {
  const results = {
    products: { success: false, count: 0, error: null },
    orders: { success: false, count: 0, error: null },
    activities: { success: false, count: 0, error: null }
  };

  try {
    // Add products
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), product);
      results.products.count++;
    }
    results.products.success = true;

    // Add orders
    for (const order of sampleOrders) {
      await addDoc(collection(db, 'orders'), order);
      results.orders.count++;
    }
    results.orders.success = true;

    // Add activities
    for (const activity of sampleActivities) {
      await addDoc(collection(db, 'activities'), activity);
      results.activities.count++;
    }
    results.activities.success = true;

    return results;
  } catch (error) {
    console.error("Error seeding database:", error);
    return {
      ...results,
      error: error.message
    };
  }
};

// Utility function to create a simple document in a collection
export const createSampleDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error(`Error creating sample ${collectionName} document:`, error);
    return { success: false, error: error.message };
  }
};

export default seedDatabase;