// src/utils/fakerData.js - Enhanced version
import { collection, addDoc, writeBatch, serverTimestamp, doc, setDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Generate random data for the dashboard with enhanced support for all components
 */
export const generateFakerData = async (options = {}) => {
  try {
    const { 
      productsCount = 25, 
      ordersCount = 30, 
      activitiesCount = 20,
      clearExisting = true,
      lowStockThreshold = 5
    } = options;
    
    // Clear existing data if requested
    if (clearExisting) {
      await clearCollections(['products', 'orders', 'activities', 'metrics']);
    }
    
    // Generate and add products
    const products = generateProducts(productsCount, lowStockThreshold);
    await addProductsToFirestore(products);
    
    // Generate and add orders
    const orders = generateOrders(ordersCount, products);
    await addOrdersToFirestore(orders);
    
    // Generate and add activities
    const activities = generateActivities(activitiesCount, products, orders);
    await addActivitiesToFirestore(activities);
    
    // Generate and add metrics
    const metrics = generateMetrics(orders, products);
    await addMetricsToFirestore(metrics);
    
    return {
      productsCount: products.length,
      ordersCount: orders.length,
      activitiesCount: activities.length,
      metricsAdded: true,
      lowStockCount: products.filter(p => p.stock <= lowStockThreshold).length
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
      console.log(`Clearing ${collectionName} collection...`);
      const snapshot = await getDocs(collection(db, collectionName));
      
      const batch = writeBatch(db);
      let count = 0;
      const batchSize = 500; // Firestore batch limit
      
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
        
        // Commit batch when reaching limit
        if (count >= batchSize) {
          batch.commit();
          count = 0;
        }
      });
      
      // Commit any remaining deletes
      if (count > 0) {
        await batch.commit();
      }
      
      console.log(`Cleared ${snapshot.size} documents from ${collectionName}`);
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
    throw error;
  }
};

/**
 * Generate random products with diverse stock levels
 */
const generateProducts = (count, lowStockThreshold) => {
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
  
  // Generate diverse products
  for (let i = 0; i < count; i++) {
    // Select a random category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Select a random product template for the category
    const templates = productTemplates[category] || productTemplates['Electronics'];
    const productType = templates[Math.floor(Math.random() * templates.length)];
    
    // Select a random brand
    const brand = brands[Math.floor(Math.random() * brands.length)];
    
    // Generate stock - ensure some products have low stock for dashboard alerts
    let stock;
    if (i < count * 0.2) { // 20% of products have low stock
      stock = Math.max(0, Math.floor(Math.random() * lowStockThreshold));
    } else {
      stock = Math.floor(10 + Math.random() * 90); // Normal stock: 10-100
    }
    
    // Generate price based on category
    let basePrice;
    switch(category) {
      case 'Electronics':
        basePrice = 100 + Math.random() * 900;
        break;
      case 'Office Supplies':
        basePrice = 5 + Math.random() * 95;
        break;
      case 'Furniture':
        basePrice = 150 + Math.random() * 850;
        break;
      case 'Clothing':
        basePrice = 20 + Math.random() * 180;
        break;
      case 'Kitchen':
        basePrice = 30 + Math.random() * 270;
        break;
      default:
        basePrice = 25 + Math.random() * 75;
    }
    
    // Format price to 2 decimal places
    const price = parseFloat(basePrice.toFixed(2));
    
    // Calculate cost price (60-80% of selling price)
    const costPercent = 0.6 + Math.random() * 0.2;
    const costPrice = parseFloat((price * costPercent).toFixed(2));
    
    // Generate product
    const product = {
      name: `${brand} ${productType} ${100 + i}`,
      description: `High-quality ${productType.toLowerCase()} for your everyday needs.`,
      category,
      price,
      costPrice,
      stock,
      sku: `SKU-${100000 + i}`,
      supplier: brand + ' Supplies Inc.',
      reorderPoint: Math.floor(lowStockThreshold * (1 + Math.random())), // Slightly above threshold
      imageUrl: `https://source.unsplash.com/300x300/?${productType.toLowerCase()}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Random date in the past
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
    const productIds = [];
    
    for (const product of products) {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Store the document ID for reference
      productIds.push({id: docRef.id, ...product});
    }
    
    console.log(`${products.length} products added successfully`);
    return productIds;
  } catch (error) {
    console.error('Error adding products:', error);
    throw error;
  }
};

/**
 * Generate random orders with references to products
 */
const generateOrders = (count, products) => {
  const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const customerNames = [
    'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'David Brown', 
    'Emily Davis', 'Robert Wilson', 'Jennifer Taylor', 'Michael Miller', 'Lisa Anderson'
  ];
  
  const orders = [];
  
  // Generate orders with proper distribution of dates for trends
  for (let i = 0; i < count; i++) {
    // Generate date - distribute over the last 6 months for trend data
    const monthOffset = Math.floor(Math.random() * 6); // 0-5 months ago
    const dayOffset = Math.floor(Math.random() * 30); // 0-29 days
    
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    date.setDate(date.getDate() - dayOffset);
    
    // Generate customer
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    
    // Generate status - make newer orders more likely to be pending/processing
    let status;
    if (monthOffset === 0 && dayOffset < 7) { // Within the last week
      // 70% chance of pending/processing for recent orders
      status = Math.random() < 0.7 
        ? (Math.random() < 0.5 ? 'pending' : 'processing') 
        : statuses[Math.floor(Math.random() * statuses.length)];
    } else {
      // Older orders more likely to be completed
      status = Math.random() < 0.6 
        ? 'completed' 
        : statuses[Math.floor(Math.random() * statuses.length)];
    }
    
    // Generate order items (1-5 items)
    const itemCount = 1 + Math.floor(Math.random() * 5);
    const items = [];
    let total = 0;
    
    // Add random products
    const usedProductIndices = new Set();
    for (let j = 0; j < itemCount; j++) {
      let productIndex;
      
      // Make sure we don't use the same product twice
      do {
        productIndex = Math.floor(Math.random() * products.length);
      } while (usedProductIndices.has(productIndex) && usedProductIndices.size < products.length);
      
      if (usedProductIndices.size >= products.length) break;
      
      usedProductIndices.add(productIndex);
      const product = products[productIndex];
      
      // Random quantity (1-5)
      const quantity = 1 + Math.floor(Math.random() * 5);
      const itemTotal = product.price * quantity;
      
      items.push({
        productId: product.id || `product-${Math.floor(Math.random() * 1000)}`, // Use ID if available or generate mock ID
        productName: product.name,
        productSku: product.sku,
        category: product.category,
        price: product.price,
        quantity,
        total: parseFloat(itemTotal.toFixed(2))
      });
      
      total += itemTotal;
    }
    
    // Format total to 2 decimal places
    total = parseFloat(total.toFixed(2));
    
    // Generate shipping address
    const shippingAddress = {
      street: `${1000 + Math.floor(Math.random() * 9000)} Main Street`,
      city: ['Springfield', 'Riverdale', 'Oakville', 'Franklin', 'Millfield'][Math.floor(Math.random() * 5)],
      state: ['CA', 'NY', 'TX', 'IL', 'FL'][Math.floor(Math.random() * 5)],
      zipCode: `${10000 + Math.floor(Math.random() * 90000)}`,
      country: 'USA'
    };
    
    // Create order object
    const order = {
      customerName,
      customerEmail: customerName.toLowerCase().replace(' ', '.') + '@example.com',
      status,
      items,
      itemCount,
      total,
      tax: parseFloat((total * 0.08).toFixed(2)),
      shippingCost: parseFloat((5.99 + Math.random() * 10).toFixed(2)),
      shippingAddress,
      paymentMethod: Math.random() < 0.7 ? 'Credit Card' : 'PayPal',
      notes: Math.random() < 0.3 ? 'Please deliver after 5pm' : '',
      createdAt: date
    };
    
    // Calculate grand total
    order.grandTotal = parseFloat((order.total + order.tax + order.shippingCost).toFixed(2));
    
    orders.push(order);
  }
  
  return orders;
};

/**
 * Add orders to Firestore
 */
const addOrdersToFirestore = async (orders) => {
  try {
    const orderIds = [];
    
    for (const order of orders) {
      // Extract items for subcollection
      const { items, ...orderDetails } = order;
      
      // Create order document
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...orderDetails,
        createdAt: Timestamp.fromDate(order.createdAt), // Use Firestore Timestamp
        updatedAt: serverTimestamp()
      });
      
      // Add order items as a subcollection
      for (const item of items) {
        await addDoc(collection(db, 'orders', orderRef.id, 'orderItems'), item);
      }
      
      // Store the document ID for reference
      orderIds.push({id: orderRef.id, ...order});
    }
    
    console.log(`${orders.length} orders added successfully`);
    return orderIds;
  } catch (error) {
    console.error('Error adding orders:', error);
    throw error;
  }
};

/**
 * Generate diverse activities for dashboard timeline
 */
const generateActivities = (count, products, orders) => {
  const activities = [];
  const types = ['order', 'inventory', 'user', 'system'];
  
  // Ensure we have enough recent activities for the dashboard
  const recentActivitiesCount = Math.min(10, Math.ceil(count * 0.4)); // At least 40% of activities are recent
  
  // Activity templates
  const templates = {
    order: [
      { template: 'New order placed by {customerName}', recent: true },
      { template: 'Order status updated to {status}', recent: false },
      { template: 'Order shipped to {customerName}', recent: false },
      { template: 'Order completed for {customerName}', recent: false }
    ],
    inventory: [
      { template: 'Product "{productName}" is low on stock ({stock} remaining)', recent: true },
      { template: 'Stock updated for {productName} (+{quantity} units)', recent: false },
      { template: 'New product added: {productName}', recent: false },
      { template: 'Price updated for {productName}', recent: false }
    ],
    user: [
      { template: 'User {userName} logged in', recent: true },
      { template: 'User {userName} updated profile', recent: false },
      { template: 'New user account created: {userName}', recent: false }
    ],
    system: [
      { template: 'System update completed successfully', recent: true },
      { template: 'Database backup completed', recent: false },
      { template: 'Daily report generated', recent: false }
    ]
  };
  
  // Generate activities
  for (let i = 0; i < count; i++) {
    // Determine if this should be a recent activity
    const isRecent = i < recentActivitiesCount;
    
    // Select activity type with weighting
    let activityType;
    const typeRoll = Math.random();
    
    if (typeRoll < 0.4) {
      activityType = 'order';
    } else if (typeRoll < 0.7) {
      activityType = 'inventory';
    } else if (typeRoll < 0.9) {
      activityType = 'user';
    } else {
      activityType = 'system';
    }
    
    // Select template
    const eligibleTemplates = isRecent 
      ? templates[activityType].filter(t => t.recent) 
      : templates[activityType];
    
    const templateObj = eligibleTemplates.length > 0 
      ? eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)]
      : templates[activityType][Math.floor(Math.random() * templates[activityType].length)];
    
    let description = templateObj.template;
    
    // Fill in template variables
    if (activityType === 'order' && orders.length > 0) {
      const order = orders[Math.floor(Math.random() * orders.length)];
      description = description
        .replace('{customerName}', order.customerName)
        .replace('{status}', order.status);
    } else if (activityType === 'inventory' && products.length > 0) {
      const product = products[Math.floor(Math.random() * products.length)];
      description = description
        .replace('{productName}', product.name)
        .replace('{stock}', product.stock)
        .replace('{quantity}', Math.floor(5 + Math.random() * 20));
    } else if (activityType === 'user') {
      const users = ['admin', 'manager', 'sales', 'support', 'warehouse'];
      description = description.replace('{userName}', users[Math.floor(Math.random() * users.length)]);
    }
    
    // Generate time - recent activities within the last day, others older
    let activityDate;
    if (isRecent) {
      // Recent activities (last 24 hours)
      const minutesAgo = Math.floor(Math.random() * 24 * 60);
      activityDate = new Date(Date.now() - minutesAgo * 60 * 1000);
    } else {
      // Older activities (last 30 days)
      const daysAgo = 1 + Math.floor(Math.random() * 29);
      activityDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    }
    
    // Create activity
    const activity = {
      type: activityType,
      description,
      createdAt: activityDate
    };
    
    // Add reference IDs for linking
    if (activityType === 'order' && orders.length > 0) {
      const order = orders[Math.floor(Math.random() * orders.length)];
      activity.orderId = order.id;
    } else if (activityType === 'inventory' && products.length > 0) {
      const product = products[Math.floor(Math.random() * products.length)];
      activity.productId = product.id;
    }
    
    activities.push(activity);
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
        createdAt: Timestamp.fromDate(activity.createdAt) // Use Firestore Timestamp
      });
    }
    console.log(`${activities.length} activities added successfully`);
  } catch (error) {
    console.error('Error adding activities:', error);
    throw error;
  }
};

/**
 * Generate metrics with monthly data for charts
 */
const generateMetrics = (orders, products) => {
  // Calculate monthly revenue data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const monthlyRevenue = [];
  
  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = new Date();
    month.setMonth(today.getMonth() - i);
    
    const monthName = monthNames[month.getMonth()];
    const monthYear = month.getFullYear();
    const monthStart = new Date(monthYear, month.getMonth(), 1);
    const monthEnd = new Date(monthYear, month.getMonth() + 1, 0);
    
    // Sum revenue for this month
    const monthRevenue = orders
      .filter(order => order.createdAt >= monthStart && order.createdAt <= monthEnd)
      .reduce((sum, order) => sum + order.total, 0);
    
    // Add some randomness for smoother trends
    const adjustedRevenue = Math.max(
      2000, // Minimum value
      monthRevenue + (monthRevenue * (Math.random() * 0.2 - 0.1)) // +/- 10%
    );
    
    monthlyRevenue.push({
      month: monthName,
      revenue: parseFloat(adjustedRevenue.toFixed(2))
    });
  }
  
  // Calculate inventory by category
  const inventoryByCategory = {};
  products.forEach(product => {
    if (!inventoryByCategory[product.category]) {
      inventoryByCategory[product.category] = {
        count: 0,
        value: 0
      };
    }
    
    inventoryByCategory[product.category].count++;
    inventoryByCategory[product.category].value += product.price * product.stock;
  });
  
  // Format inventory data for charts
  const categoryData = Object.keys(inventoryByCategory).map(category => ({
    category,
    count: inventoryByCategory[category].count,
    value: parseFloat(inventoryByCategory[category].value.toFixed(2))
  }));
  
  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Calculate comparison data (current vs previous period)
  const now = new Date();
  const thisMonth = now.getMonth();
  const lastMonth = (thisMonth - 1 + 12) % 12; // Handle January correctly
  
  const thisMonthRevenue = orders
    .filter(order => order.createdAt.getMonth() === thisMonth)
    .reduce((sum, order) => sum + order.total, 0);
    
  const lastMonthRevenue = orders
    .filter(order => order.createdAt.getMonth() === lastMonth)
    .reduce((sum, order) => sum + order.total, 0);
  
  // Calculate percent change
  const percentChange = lastMonthRevenue === 0 
    ? 100 
    : Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
  
  // Create metrics object
  return {
    revenue: {
      total: parseFloat(totalRevenue.toFixed(2)),
      percentChange,
      monthly: monthlyRevenue,
      lastUpdated: new Date()
    },
    inventory: {
      categories: categoryData,
      usagePercent: 32, // Mock percentage
      percentChange: -4, // Mock change
      lastUpdated: new Date()
    },
    orders: {
      total: orders.length,
      percentChange: 8, // Mock change
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