// src/utils/seedFirebase.js
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Function to seed the database with sample products and orders if none exist
 * This should be called once during application initialization
 */
export const seedFirebaseData = async () => {
  try {
    // Check if products already exist
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    // Only seed products if none exist
    if (productsSnapshot.empty) {
      console.log('Seeding products to Firebase...');
      
      // Sample products data
      const productsData = [
        {
          name: 'Premium Office Chair',
          sku: 'CHAIR-001',
          category: 'Furniture',
          price: 249.99,
          stock: 15,
          description: 'Ergonomic office chair with lumbar support and adjustable height.',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
          costPrice: 175.50,
          supplier: 'Office Essentials Inc.',
          reorderPoint: 5,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Wireless Keyboard',
          sku: 'KEY-100',
          category: 'Electronics',
          price: 79.99,
          stock: 8,
          description: 'Bluetooth wireless keyboard with backlit keys and ergonomic design.',
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
          costPrice: 45.00,
          supplier: 'TechGear Supplies',
          reorderPoint: 10,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Wireless Mouse',
          sku: 'MOUSE-55',
          category: 'Electronics',
          price: 39.99,
          stock: 12,
          description: 'Ergonomic wireless mouse with adjustable DPI settings.',
          imageUrl: 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3',
          costPrice: 18.50,
          supplier: 'TechGear Supplies',
          reorderPoint: 8,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'USB Flash Drive 32GB',
          sku: 'USB-32GB',
          category: 'Electronics',
          price: 19.99,
          stock: 4,
          description: '32GB USB 3.0 flash drive with metal casing.',
          imageUrl: 'https://images.unsplash.com/photo-1624913503273-5f9c4e980dba',
          costPrice: 8.75,
          supplier: 'Digital Storage Co.',
          reorderPoint: 15,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Desk Lamp',
          sku: 'LAMP-201',
          category: 'Office Supplies',
          price: 35.50,
          stock: 20,
          description: 'LED desk lamp with adjustable brightness and color temperature.',
          imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
          costPrice: 16.80,
          supplier: 'Office Essentials Inc.',
          reorderPoint: 7,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Premium Notebook',
          sku: 'NOTE-512',
          category: 'Office Supplies',
          price: 12.99,
          stock: 35,
          description: 'Premium hardcover notebook with 240 pages of acid-free paper.',
          imageUrl: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c',
          costPrice: 5.20,
          supplier: 'Paper Products Ltd.',
          reorderPoint: 20,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];
      
      // Add products to Firestore
      for (const product of productsData) {
        await addDoc(collection(db, 'products'), product);
      }
      
      console.log('Products seeded successfully!');
    }
    
    // Check if orders already exist
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    
    // Only seed orders if none exist
    if (ordersSnapshot.empty) {
      console.log('Seeding orders to Firebase...');
      
      // Get product IDs for order items
      const updatedProductsSnapshot = await getDocs(productsRef);
      const productsList = [];
      updatedProductsSnapshot.forEach(doc => {
        productsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sample order data
      const ordersData = [
        {
          customerName: 'John Smith',
          customerEmail: 'john.smith@example.com',
          status: 'completed',
          total: 149.99,
          items: [
            {
              productId: productsList[0].id,
              productName: productsList[0].name,
              price: productsList[0].price,
              quantity: 1
            },
            {
              productId: productsList[2].id,
              productName: productsList[2].name,
              price: productsList[2].price,
              quantity: 1
            }
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'NY',
            zipCode: '12345'
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah.j@example.com',
          status: 'pending',
          total: 79.50,
          items: [
            {
              productId: productsList[1].id,
              productName: productsList[1].name,
              price: productsList[1].price,
              quantity: 1
            }
          ],
          shippingAddress: {
            street: '456 Elm St',
            city: 'Othertown',
            state: 'CA',
            zipCode: '90210'
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          customerName: 'Mike Anderson',
          customerEmail: 'mike.a@example.com',
          status: 'completed',
          total: 237.75,
          items: [
            {
              productId: productsList[4].id,
              productName: productsList[4].name,
              price: productsList[4].price,
              quantity: 2
            },
            {
              productId: productsList[5].id,
              productName: productsList[5].name,
              price: productsList[5].price,
              quantity: 3
            },
            {
              productId: productsList[3].id,
              productName: productsList[3].name,
              price: productsList[3].price,
              quantity: 1
            }
          ],
          shippingAddress: {
            street: '789 Oak St',
            city: 'Somewhere',
            state: 'TX',
            zipCode: '75001'
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];
      
      // Add orders to Firestore
      for (const order of ordersData) {
        // Create the order document
        const orderRef = await addDoc(collection(db, 'orders'), {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          status: order.status,
          total: order.total,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        });
        
        // Add order items as a subcollection
        for (const item of order.items) {
          await addDoc(collection(db, 'orders', orderRef.id, 'orderItems'), item);
        }
      }
      
      console.log('Orders seeded successfully!');
    }
    
    return true;
  } catch (error) {
    console.error('Error seeding Firebase data:', error);
    return false;
  }
};

export default seedFirebaseData;