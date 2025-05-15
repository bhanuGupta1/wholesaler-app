// src/utils/fakerData.js
import { collection, addDoc, writeBatch, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Generate random data for the dashboard
 */
export const generateFakerData = async (options = {}) => {
  try {
    const { 
      productsCount = 20, 
      ordersCount = 15, 
      activitiesCount = 10,
      clearExisting = true 
    } = options;
    
    // Clear existing data if requested
    if (clearExisting) {
      await clearCollections(['products', 'orders', 'activities', 'metrics']);
    }
    
    // Generate and add products
    const products = generateProducts(productsCount);
    await addProductsToFirestore(products);
    
    // Generate and add orders
    const orders = generateOrders(ordersCount, products);
    await addOrdersToFirestore(orders);
    
    // Generate and add activities
    const activities = generateActivities(activitiesCount, products, orders);
    await addActivitiesToFirestore(activities);
    
    // Generate and add metrics
    const metrics = generateMetrics(orders);
    await addMetricsToFirestore(metrics);
    
    return {
      productsCount: products.length,
      ordersCount: orders.length,
      activitiesCount: activities.length
    };
  } catch (error) {
    console.error('Error generating random data:', error);
    throw error;
  }
};

/**
 * Clear collections for fresh data
 */
const clearCollections = async (collectionNames) => {
  try {
    for (const collectionName of collectionNames) {
      const batch = writeBatch(db);
      const snapshot = await db.collection(collectionName).get();
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      if (snapshot.docs.length > 0) {
        await batch.commit();
      }
    }
    console.log('Collections cleared successfully');
  } catch (error) {
    console.error('Error clearing collections:', error);
    throw error;
  }
};

/**
 * Generate random products
 */
const generateProducts = (count) => {
  const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Clothing', 'Kitchen'];
  const products = [];
  
  // Product name templates
  const productTemplates = {
    'Electronics': ['Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Speaker'],
    'Office Supplies': ['Pen Set', 'Notebook', 'Stapler', 'Paper Clips', 'Binder', 'Desk Organizer'],
    'Furniture': ['Desk', 'Chair', 'Bookshelf', 'Filing Cabinet', 'Coffee Table', 'Sofa'],
    'Clothing': ['T-Shirt', 'Jeans', 'Sweater', 'Jacket', 'Socks', 'Hat', 'Scarf'],
    'Kitchen': ['Blender', 'Toaster', 'Coffee Maker', 'Knife Set', 'Cutting Board', 'Plate Set']
  };
  
  // Brands
  const brands = ['TechPro', 'OfficeMate', 'HomeStyle', 'FashionPlus', 'KitchenWare'];
  
  for (let i = 0; i < count; i++) {
    // Select a random category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Select a random product template for the category
    const templates = productTemplates[category] || productTemplates['Electronics'];
    const productType = templates[Math.floor(Math.random() * templates.length)];
    
    // Select a random brand
    const brand = brands[Math.floor(Math.random() * brands.length)];
    
    // Generate product
    const product = {
      name: `${brand} ${productType} ${100 + i}`,
      description: `High-quality ${productType.toLowerCase()} for your everyday needs.`,
      category,
      price: Math.floor(Math.random() * 900) + 100, // Random price between 100 and 999
      stock: Math.floor(Math.random() * 50) + 1, // Random stock between 1 and 50
      sku: `SKU-${100000 + i}`,
      supplier: brand + ' Supplies Inc.',
      reorderPoint: Math.floor(Math.random() * 8) + 3, // Random reorder point between 3 and 10
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random date in the past
    };
    
    products.push(product);
  }
  
  return products;
};

/**
 * Add products to Firestore
 */
const addProductsToFirestore = async (products) => {
  try {
    for (const product of products) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`${products.length} products added successfully`);
  } catch (error) {
    console.error('Error adding products:', error);
    throw error;
  }
};

/**
 * Generate random orders
 */
const generateOrders = (count, products) => {
  const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const customerNames = [
    'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'David Brown', 
    'Emily Davis', 'Robert Wilson', 'Jennifer Taylor', 'Michael Miller', 'Lisa Anderson'
  ];
  
  const orders = [];
  
  for (let i = 0; i < count; i++) {
    // Random date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Random customer
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    
    // Random status
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random items (1-5 items per order)
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let total = 0;
    
    // Add random products to the order
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity between 1 and 3
      const itemTotal = product.price * quantity;
      
      items.push({
        productId: product.id || `product-${Math.floor(Math.random() * 1000)}`, // Use ID if available or generate mock ID
        productName: product.name,
        quantity,
        price: product.price,
        total: itemTotal
      });
      
      total += itemTotal;
    }
    
    // Generate order
    const order = {
      customerName,
      customerEmail: customerName.toLowerCase().replace(' ', '.') + '@example.com',
      status,
      items,
      itemCount,
      total,
      shippingAddress: {
        street: `${Math.floor(Math.random() * 9000) + 1000} Main Street`,
        city: 'Anytown',
        state: 'State',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Country'
      },
      createdAt: date
    };
    
    orders.push(order);
  }
  
  return orders;
};

/**
 * Add orders to Firestore
 */
const addOrdersToFirestore = async (orders) => {
  try {
    for (const order of orders) {
      await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`${orders.length} orders added successfully`);
  } catch (error) {
    console.error('Error adding orders:', error);
    throw error;
  }
};

/**
 * Generate random activities
 */
const generateActivities = (count, products, orders) => {
  const activities = [];
  const types = ['order', 'inventory', 'user'];
  
  // Generate activities based on products and orders
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    let description = '';
    
    // Random date within the last 7 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    
    if (type === 'order') {
      // Order activity based on an order
      const order = orders[Math.floor(Math.random() * orders.length)];
      const actions = ['placed', 'updated', 'processed', 'shipped', 'completed', 'cancelled'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      description = `Order ${action} for ${order.customerName}`;
    } else if (type === 'inventory') {
      // Inventory activity based on a product
      const product = products[Math.floor(Math.random() * products.length)];
      const actions = ['added', 'updated', 'restocked', 'removed'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const quantity = Math.floor(Math.random() * 20) + 1;
      
      description = `Product "${product.name}" ${action} (${quantity} units)`;
    } else {
      // User activity
      const actions = ['logged in', 'updated profile', 'changed settings', 'viewed dashboard'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const users = ['Admin', 'Manager', 'Staff', 'John', 'Sarah'];
      const user = users[Math.floor(Math.random() * users.length)];
      
      description = `User ${user} ${action}`;
    }
    
    activities.push({
      type,
      description,
      createdAt: date
    });
  }
  
  return activities;
};

/**
 * Add activities to Firestore
 */
const addActivitiesToFirestore = async (activities) => {
  try {
    for (const activity of activities) {
      await addDoc(collection(db, 'activities'), {
        ...activity,
        createdAt: serverTimestamp()
      });
    }
    console.log(`${activities.length} activities added successfully`);
  } catch (error) {
    console.error('Error adding activities:', error);
    throw error;
  }
};

/**
 * Generate metrics based on orders
 */
const generateMetrics = (orders) => {
  // Calculate total revenue
  const totalRevenue = orders.reduce((total, order) => total + order.total, 0);
  
  // Calculate revenue change (random for demo)
  const percentChange = Math.floor(Math.random() * 30) - 5; // Random change between -5% and +25%
  
  // Calculate orders metrics
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  return {
    revenue: {
      total: totalRevenue,
      percentChange,
      lastUpdated: new Date()
    },
    orders: {
      total: orders.length,
      completed: completedOrders,
      pending: pendingOrders,
      percentChange: Math.floor(Math.random() * 20) - 5,
      lastUpdated: new Date()
    },
    inventory: {
      usagePercent: Math.floor(Math.random() * 70) + 20, // Random between 20% and 90%
      percentChange: Math.floor(Math.random() * 10) - 5,
      lastUpdated: new Date()
    }
  };
};

/**
 * Add metrics to Firestore
 */
const addMetricsToFirestore = async (metrics) => {
  try {
    await setDoc(doc(db, 'metrics', 'current'), {
      ...metrics,
      lastUpdated: serverTimestamp()
    });
    console.log('Metrics added successfully');
  } catch (error) {
    console.error('Error adding metrics:', error);
    throw error;
  }
};

export default generateFakerData;