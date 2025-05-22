// src/utils/seedFirebase.js - Enhanced seeding with lots of data and real images
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Enhanced product data with real images from unsplash and other sources
const PRODUCT_CATEGORIES = [
  'Electronics',
  'Office Supplies', 
  'Furniture',
  'Kitchen & Home',
  'Clothing & Apparel',
  'Sports & Outdoors',
  'Health & Beauty',
  'Tools & Hardware',
  'Books & Media',
  'Automotive'
];

// Real image URLs from various sources (Unsplash, Pixabay, etc.)
const PRODUCT_IMAGES = {
  'Electronics': [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1588200618915-dfa1d0e2ca52?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542393881221-4ad7154e1ec3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
  ],
  'Office Supplies': [
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606146485197-f65b2c44b2f4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1604580864573-3b2719aa2db9?w=400&h=400&fit=crop'
  ],
  'Furniture': [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559628233-d1de9e6ad8ad?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571898223382-b87a14952aa6?w=400&h=400&fit=crop'
  ],
  'Kitchen & Home': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556909114-d3bb9a0e3c5e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1584269600519-112e11973056?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
  ],
  'Clothing & Apparel': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'
  ],
  'Sports & Outdoors': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
  ],
  'Health & Beauty': [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1594736797933-d0902ba85cd2?w=400&h=400&fit=crop'
  ],
  'Tools & Hardware': [
    'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop'
  ],
  'Books & Media': [
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  ],
  'Automotive': [
    'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534177616072-ef31bd5fdd14?w=400&h=400&fit=crop'
  ]
};

// Expanded product name templates for each category
const PRODUCT_NAMES = {
  'Electronics': [
    'Wireless Bluetooth Headphones', 'Smartphone Case', 'USB-C Charging Cable', 'Portable Power Bank',
    'Wireless Charging Pad', 'Bluetooth Speaker', 'Tablet Stand', 'Laptop Sleeve', 'Gaming Keyboard',
    'Wireless Mouse', 'Monitor Stand', 'HD Webcam', 'Wireless Earbuds', 'Phone Holder', 'Cable Organizer',
    'Smart Watch', 'Fitness Tracker', 'Portable SSD', 'USB Hub', 'Wireless Router'
  ],
  'Office Supplies': [
    'Ergonomic Office Chair', 'Standing Desk Converter', 'Desk Organizer', 'File Cabinet', 'Whiteboard',
    'Sticky Notes Pack', 'Black Ballpoint Pens', 'Yellow Highlighters', 'Paper Clips', 'Stapler',
    'Hole Punch', 'Desktop Calculator', 'Letter Tray', 'Binder Set', 'Manila Folders',
    'Copy Paper Ream', 'Envelope Set', 'Desk Lamp', 'Bulletin Board', 'Calendar Planner'
  ],
  'Furniture': [
    'Modern Coffee Table', 'Dining Chair Set', 'Bookshelf Unit', 'Nightstand', 'Dresser',
    'Bar Stool', 'Office Desk', 'Storage Cabinet', 'TV Stand', 'Accent Chair',
    'Sofa Sectional', 'Ottoman', 'Mirror', 'Coat Rack', 'Side Table',
    'Bench Seat', 'Wardrobe', 'Shoe Rack', 'Plant Stand', 'Floor Lamp'
  ],
  'Kitchen & Home': [
    'Stainless Steel Cookware Set', 'Non-Stick Frying Pan', 'Kitchen Knife Set', 'Cutting Board',
    'Mixing Bowl Set', 'Coffee Maker', 'Blender', 'Toaster', 'Microwave', 'Air Fryer',
    'Slow Cooker', 'Food Processor', 'Stand Mixer', 'Kitchen Scale', 'Utensil Set',
    'Dish Towel Set', 'Storage Containers', 'Spice Rack', 'Can Opener', 'Wine Glasses'
  ],
  'Clothing & Apparel': [
    'Cotton T-Shirt', 'Denim Jeans', 'Casual Sneakers', 'Winter Jacket', 'Dress Shirt',
    'Leather Belt', 'Wool Sweater', 'Athletic Shorts', 'Baseball Cap', 'Leather Boots',
    'Formal Dress', 'Cardigan', 'Polo Shirt', 'Chino Pants', 'Running Shoes',
    'Hoodie', 'Scarf', 'Gloves', 'Sunglasses', 'Watch'
  ],
  'Sports & Outdoors': [
    'Yoga Mat', 'Resistance Bands Set', 'Dumbbells', 'Water Bottle', 'Camping Tent',
    'Hiking Backpack', 'Sleeping Bag', 'Fitness Tracker', 'Running Shoes', 'Basketball',
    'Soccer Ball', 'Tennis Racket', 'Golf Clubs', 'Bicycle Helmet', 'Swim Goggles',
    'Exercise Bike', 'Jump Rope', 'Foam Roller', 'Protein Shaker', 'Gym Bag'
  ],
  'Health & Beauty': [
    'Face Moisturizer', 'Vitamin C Serum', 'Sunscreen SPF 50', 'Hair Shampoo', 'Body Lotion',
    'Lip Balm', 'Hand Sanitizer', 'Essential Oils', 'Face Mask', 'Nail Polish',
    'Makeup Brush Set', 'Perfume', 'Hair Dryer', 'Electric Toothbrush', 'Skincare Set',
    'Beard Oil', 'Massage Oil', 'Bath Bombs', 'Wellness Supplements', 'Aromatherapy Diffuser'
  ],
  'Tools & Hardware': [
    'Cordless Drill', 'Hammer Set', 'Screwdriver Kit', 'Wrench Set', 'Measuring Tape',
    'Level Tool', 'Safety Glasses', 'Work Gloves', 'Tool Box', 'Socket Set',
    'Pliers Set', 'Utility Knife', 'Stud Finder', 'Flashlight', 'Extension Cord',
    'Wire Strippers', 'Multimeter', 'Paint Brush Set', 'Sandpaper Pack', 'Hardware Screws'
  ],
  'Books & Media': [
    'Fiction Novel', 'Business Book', 'Self-Help Guide', 'Cookbook', 'Travel Guide',
    'Art Book', 'History Biography', 'Science Textbook', 'Language Dictionary', 'Poetry Collection',
    'Comic Book', 'Photography Book', 'Music CD', 'Documentary DVD', 'Audio Book',
    'Magazine Subscription', 'Notebook', 'Journal', 'Sketch Pad', 'Reading Light'
  ],
  'Automotive': [
    'Car Phone Mount', 'Dash Cam', 'Car Charger', 'Floor Mats', 'Air Freshener',
    'Steering Wheel Cover', 'Car Vacuum', 'Jump Starter', 'Tire Pressure Gauge', 'Car Wax',
    'Seat Covers', 'Windshield Wiper', 'Car Bluetooth Adapter', 'Emergency Kit', 'Cup Holder',
    'Trunk Organizer', 'Car Sunshade', 'License Plate Frame', 'Car Antenna', 'Fuel Additive'
  ]
};

const SUPPLIERS = [
  'TechSource Ltd', 'Global Supplies Co', 'Premier Products', 'Wholesale Direct',
  'Quality First Inc', 'Mega Distribution', 'Elite Suppliers', 'Universal Trading',
  'Swift Logistics', 'ProVendor Corp', 'Master Wholesale', 'Prime Distributors',
  'Apex Supply Chain', 'Superior Products', 'Direct Source Ltd', 'Reliable Suppliers',
  'Premium Wholesale', 'Express Distribution', 'TopTier Trading', 'Advanced Supply Co'
];

const CUSTOMER_NAMES = [
  'Acme Corporation', 'Tech Innovations LLC', 'Global Enterprises', 'Future Systems Inc',
  'Dynamic Solutions', 'Advanced Technologies', 'Premier Business Group', 'Strategic Partners',
  'Innovation Hub', 'Digital Dynamics', 'Smart Solutions Co', 'NextGen Industries',
  'Quantum Systems', 'Velocity Corp', 'Alpha Enterprises', 'Beta Solutions',
  'Gamma Industries', 'Delta Innovations', 'Epsilon Technologies', 'Zeta Corporation',
  'Metro Office Supplies', 'City Electronics', 'Downtown Retail', 'Suburban Stores',
  'Regional Distributors', 'Local Business Network', 'Commerce Solutions', 'Trade Partners',
  'Pacific Rim Trading', 'Atlantic Supply Chain', 'Continental Distribution', 'International Trading Co'
];

// Generate random product data
function generateProduct(category) {
  const categoryNames = PRODUCT_NAMES[category] || PRODUCT_NAMES['Electronics'];
  const categoryImages = PRODUCT_IMAGES[category] || PRODUCT_IMAGES['Electronics'];
  
  const name = categoryNames[Math.floor(Math.random() * categoryNames.length)];
  const basePrice = Math.random() * 500 + 10; // $10 - $510
  const costPrice = basePrice * (0.4 + Math.random() * 0.3); // 40-70% of selling price
  const stock = Math.floor(Math.random() * 200) + 1;
  const imageUrl = categoryImages[Math.floor(Math.random() * categoryImages.length)];
  
  return {
    name,
    sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    description: `Premium quality ${name.toLowerCase()} perfect for professional and personal use. High-grade materials and excellent craftsmanship.`,
    category,
    price: parseFloat(basePrice.toFixed(2)),
    costPrice: parseFloat(costPrice.toFixed(2)),
    stock,
    reorderPoint: Math.max(5, Math.floor(stock * 0.2)),
    supplier: SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)],
    imageUrl,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    updatedAt: new Date()
  };
}

// Generate random order data
function generateOrder(productIds) {
  const customerName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
  const itemCount = Math.floor(Math.random() * 5) + 1; // 1-5 items per order
  const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Random date within last 60 days
  
  // Generate order items
  const items = [];
  let total = 0;
  
  for (let i = 0; i < itemCount; i++) {
    const productId = productIds[Math.floor(Math.random() * productIds.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const price = Math.random() * 200 + 20; // $20-$220 per item
    const itemTotal = price * quantity;
    
    items.push({
      productId,
      productName: `Product ${i + 1}`,
      quantity,
      price: parseFloat(price.toFixed(2)),
      total: parseFloat(itemTotal.toFixed(2))
    });
    
    total += itemTotal;
  }
  
  const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    customerName,
    customerEmail: `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@company.com`,
    customerPhone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    items,
    itemCount,
    total: parseFloat(total.toFixed(2)),
    status,
    createdAt: Timestamp.fromDate(createdAt),
    updatedAt: Timestamp.fromDate(new Date()),
    notes: status === 'cancelled' ? 'Customer requested cancellation' : 'Standard order processing'
  };
}

// Generate activity data
function generateActivity(type = 'order') {
  const orderActivities = [
    'New order received from customer',
    'Order payment confirmed',
    'Order shipped to customer',
    'Order delivered successfully', 
    'Order cancelled by customer',
    'Order refunded to customer'
  ];
  
  const inventoryActivities = [
    'Product stock updated',
    'New product added to inventory',
    'Product price updated',
    'Low stock alert triggered',
    'Product discontinued',
    'Bulk inventory update completed'
  ];
  
  const activities = type === 'order' ? orderActivities : inventoryActivities;
  const description = activities[Math.floor(Math.random() * activities.length)];
  const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random date within last 7 days
  
  return {
    type,
    description,
    createdAt: Timestamp.fromDate(createdAt),
    updatedAt: Timestamp.fromDate(new Date())
  };
}

// Main seeding function
export async function seedFirebaseData(forceReseed = false) {
  try {
    console.log('🌱 Starting Firebase data seeding...');
    
    // Check if data already exists
    if (!forceReseed) {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      if (!productsSnapshot.empty) {
        console.log('✅ Data already exists, skipping seed');
        return true;
      }
    }
    
    // Clear existing data if force reseeding
    if (forceReseed) {
      console.log('🗑️  Clearing existing data...');
      
      const collections = ['products', 'orders', 'activities', 'metrics'];
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        const batch = writeBatch(db);
        
        snapshot.docs.forEach((document) => {
          batch.delete(doc(db, collectionName, document.id));
        });
        
        if (snapshot.docs.length > 0) {
          await batch.commit();
          console.log(`   Cleared ${snapshot.docs.length} documents from ${collectionName}`);
        }
      }
    }
    
    console.log('📦 Generating products...');
    
    // Generate products (500 products total)
    const products = [];
    const productsPerCategory = Math.floor(500 / PRODUCT_CATEGORIES.length);
    
    for (const category of PRODUCT_CATEGORIES) {
      for (let i = 0; i < productsPerCategory; i++) {
        products.push(generateProduct(category));
      }
    }
    
    // Add products to Firestore in batches
    const productIds = [];
    let batch = writeBatch(db);
    let batchCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const productRef = doc(collection(db, 'products'));
      batch.set(productRef, products[i]);
      productIds.push(productRef.id);
      batchCount++;
      
      // Commit batch every 500 operations (Firestore limit)
      if (batchCount === 500 || i === products.length - 1) {
        await batch.commit();
        console.log(`   Added ${batchCount} products to database`);
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    
    console.log(`✅ Added ${products.length} products`);
    
    console.log('📋 Generating orders...');
    
    // Generate orders (200 orders)
    const orders = [];
    for (let i = 0; i < 200; i++) {
      orders.push(generateOrder(productIds));
    }
    
    // Add orders to Firestore
    batch = writeBatch(db);
    batchCount = 0;
    
    for (let i = 0; i < orders.length; i++) {
      const orderRef = doc(collection(db, 'orders'));
      batch.set(orderRef, orders[i]);
      batchCount++;
      
      if (batchCount === 500 || i === orders.length - 1) {
        await batch.commit();
        console.log(`   Added ${batchCount} orders to database`);
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    
    console.log(`✅ Added ${orders.length} orders`);
    
    console.log('📊 Generating activities...');
    
    // Generate activities (100 activities)
    const activities = [];
    for (let i = 0; i < 50; i++) {
      activities.push(generateActivity('order'));
      activities.push(generateActivity('inventory'));
    }
    
    // Add activities to Firestore
    batch = writeBatch(db);
    batchCount = 0;
    
    for (let i = 0; i < activities.length; i++) {
      const activityRef = doc(collection(db, 'activities'));
      batch.set(activityRef, activities[i]);
      batchCount++;
      
      if (batchCount === 500 || i === activities.length - 1) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    
    console.log(`✅ Added ${activities.length} activities`);
    
    console.log('📈 Generating metrics...');
    
    // Generate sample metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const metrics = {
      revenue: {
        total: parseFloat(totalRevenue.toFixed(2)),
        percentChange: Math.floor(Math.random() * 50) + 10 // 10-60% growth
      },
      products: {
        total: products.length,
        lowStock: products.filter(p => p.stock <= 10).length
      },
      orders: {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length
      },
      lastUpdated: Timestamp.fromDate(new Date())
    };
    
    await setDoc(doc(db, 'metrics', 'current'), metrics);
    console.log('✅ Added metrics data');
    
    console.log(`🎉 Successfully seeded Firebase with:`);
    console.log(`   • ${products.length} products with real images`);
    console.log(`   • ${orders.length} orders`);
    console.log(`   • ${activities.length} activities`);
    console.log(`   • Comprehensive metrics data`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error seeding Firebase data:', error);
    throw error;
  }
}

// Helper function to get a random subset of an array
function getRandomSubset(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Export additional utility functions
export { PRODUCT_CATEGORIES, PRODUCT_IMAGES, PRODUCT_NAMES };