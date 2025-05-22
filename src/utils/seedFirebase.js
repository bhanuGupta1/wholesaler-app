// src/utils/seedFirebase.js - Smaller, more reliable seeder
import { collection, addDoc, getDocs, doc, setDoc, serverTimestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Function to seed the database with sample data
 * This version is smaller and more reliable
 */
export const seedFirebaseData = async (forceReseed = false) => {
  try {
    console.log('Starting Firebase data seeding process...');
    
    // Check if data already exists first
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    // If we already have products and not forcing reseed, just return
    if (!productsSnapshot.empty && !forceReseed) {
      console.log(`Using ${productsSnapshot.size} existing products. Set forceReseed to true to recreate data.`);
      return true;
    }
    
    // If we're here, we need to seed data
    if (forceReseed) {
      console.log('Force reseed enabled - clearing existing data...');
      await clearCollection('products');
      await clearCollection('orders');
      await clearCollection('activities');
    }
    
    // Generate small dataset to prevent timeouts
    console.log('Creating sample data...');
    
    // Create products
    const products = await seedProducts(8); // Smaller number
    
    // Create orders
    const orders = await seedOrders(5, products); // Smaller number
    
    // Create activities
    await seedActivities(5, products, orders); // Smaller number
    
    // Create metrics
    await seedMetrics();
    
    console.log('Seeding process completed successfully!');
    
    return true;
  } catch (error) {
    console.error('Error seeding Firebase data:', error);
    throw error; // Rethrow to handle in the UI
  }
};

/**
 * Clear a collection to start fresh
 */
const clearCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    // Use batched writes for efficiency
    const batchSize = 100;
    let batch = writeBatch(db);
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
      
      // Commit batch when it reaches batchSize
      if (count === batchSize) {
        batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    });
    
    // Commit any remaining deletes
    if (count > 0) {
      await batch.commit();
    }
    
    console.log(`Cleared ${snapshot.size} documents from ${collectionName}`);
  } catch (error) {
    console.error(`Error clearing ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Seed products with realistic data
 */
const seedProducts = async (count) => {
  const categories = ['Electronics', 'Office Supplies', 'Furniture'];
  const suppliers = ['Office Essentials Inc.', 'TechGear Supplies'];
  
  const productNames = [
    "Wireless Keyboard",
    "Ergonomic Mouse",
    "27-inch Monitor",
    "Desk Lamp",
    "Office Chair",
    "Standing Desk",
    "USB Hub",
    "Laptop Stand",
    "Webcam HD",
    "Noise-Cancelling Headphones"
  ];
  
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const name = productNames[i % productNames.length] + " " + (i + 1);
    const price = 20 + (i * 15); // Simple price formula
    const stock = Math.max(3, (i * 5) % 25); // Simple stock formula
    
    const product = {
      name,
      sku: `SKU-${100 + i}`,
      category,
      price,
      stock,
      description: `High-quality ${name.toLowerCase()} for office and home use.`,
      imageUrl: `https://source.unsplash.com/400x300/?${category.toLowerCase().replace(' ', '-')},product`,
      costPrice: price * 0.6, // 60% of selling price
      supplier: suppliers[i % suppliers.length],
      reorderPoint: 5,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'products'), product);
    
    products.push({
      id: docRef.id,
      ...product
    });
  }
  
  console.log(`Created ${products.length} products`);
  return products;
};

/**
 * Seed orders with realistic data
 */
const seedOrders = async (count, products) => {
  const statuses = ['pending', 'completed', 'shipped'];
  const customers = [
    "John Smith",
    "Sarah Johnson",
    "Michael Brown",
    "Emily Wilson",
    "David Clark"
  ];
  
  const orders = [];
  
  for (let i = 0; i < count; i++) {
    // Create 1-3 items per order
    const itemCount = 1 + (i % 3);
    const items = [];
    let totalAmount = 0;
    
    // Select products for order items
    for (let j = 0; j < itemCount; j++) {
      const prodIndex = (i + j) % products.length;
      const product = products[prodIndex];
      const quantity = 1 + (j % 3);
      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;
      
      items.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity
      });
    }
    
    // Determine date (simple formula for different dates)
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - (i * 2)); // Each order 2 days apart
    
    // Create the order
    const order = {
      customerName: customers[i % customers.length],
      customerEmail: `customer${i+1}@example.com`,
      status: statuses[i % statuses.length],
      total: parseFloat(totalAmount.toFixed(2)),
      itemCount,
      shippingAddress: {
        street: `${100 + i} Main St`,
        city: "Anytown",
        state: "ST",
        zipCode: "12345"
      },
      createdAt: orderDate,
      updatedAt: orderDate
    };
    
    // Add to Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add order items as a subcollection
    for (const item of items) {
      await addDoc(collection(db, 'orders', orderRef.id, 'orderItems'), item);
    }
    
    orders.push({
      id: orderRef.id,
      ...order,
      items
    });
  }
  
  console.log(`Created ${orders.length} orders`);
  return orders;
};

/**
 * Seed simple activity log
 */
const seedActivities = async (count, products, orders) => {
  const activityTypes = ['order', 'inventory'];
  
  for (let i = 0; i < count; i++) {
    const activityType = activityTypes[i % activityTypes.length];
    let description = '';
    
    // Randomize timestamp within last 7 days
    const activityDate = new Date();
    activityDate.setDate(activityDate.getDate() - (i % 7));
    activityDate.setHours(9 + (i % 8)); // Business hours
    
    // Create description and details based on activity type
    if (activityType === 'order') {
      const orderIndex = i % orders.length;
      const order = orders[orderIndex];
      const actions = ['placed', 'completed', 'shipped'];
      const action = actions[i % actions.length];
      
      description = `Order #${order.id.slice(0, 6)} ${action} for ${order.customerName}`;
    } else {
      const productIndex = i % products.length;
      const product = products[productIndex];
      const actions = ['added', 'updated', 'restocked'];
      const action = actions[i % actions.length];
      const quantity = 5 + (i * 2);
      
      description = `${product.name} ${action} (${quantity} units)`;
    }
    
    // Add to Firestore
    await addDoc(collection(db, 'activities'), {
      type: activityType,
      description,
      createdAt: activityDate,
      timestamp: serverTimestamp()
    });
  }
  
  console.log(`Created ${count} activities`);
};

/**
 * Seed metrics for dashboard
 */
const seedMetrics = async () => {
  const metrics = {
    revenue: {
      total: 7320.80,
      percentChange: 16,
      lastUpdated: serverTimestamp()
    },
    orders: {
      total: 18,
      percentChange: 8,
      lastUpdated: serverTimestamp()
    },
    inventory: {
      usagePercent: 32,
      percentChange: -4,
      lastUpdated: serverTimestamp()
    }
  };
  
  await setDoc(doc(db, 'metrics', 'current'), metrics);
  console.log('Created metrics');
};

export default seedFirebaseData;