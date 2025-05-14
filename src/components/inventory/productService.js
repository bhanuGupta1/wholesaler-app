// src/services/productService.js
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'products';

/**
 * Fetch all products from Firestore
 * @returns {Promise<Array>} - Array of product objects with id
 */
export const getAllProducts = async () => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const productsSnapshot = await getDocs(productsRef);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch products with low stock levels
 * @param {number} threshold - The stock threshold to use (default: 10)
 * @returns {Promise<Array>} - Array of low stock product objects
 */
export const getLowStockProducts = async (threshold = 10) => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where('stock', '<=', threshold),
      orderBy('stock')
    );
    
    const productsSnapshot = await getDocs(q);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by ID
 * @param {string} id - The product ID to fetch
 * @returns {Promise<Object|null>} - The product object or null if not found
 */
export const getProductById = async (id) => {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Search for products by name or SKU
 * @param {string} searchTerm - The search term to use
 * @returns {Promise<Array>} - Array of matching product objects
 */
export const searchProducts = async (searchTerm) => {
  try {
    // Firebase doesn't support direct text search, so we need to get all products
    // and filter on the client side
    const products = await getAllProducts();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Create a new product
 * @param {Object} productData - The product data to add
 * @returns {Promise<string>} - The ID of the newly created product
 */
export const createProduct = async (productData) => {
  try {
    // Add timestamps
    const dataWithTimestamps = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 * @param {string} id - The ID of the product to update
 * @param {Object} productData - The updated product data
 * @returns {Promise<void>}
 */
export const updateProduct = async (id, productData) => {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    
    // Add updated timestamp
    const dataWithTimestamp = {
      ...productData,
      updatedAt: new Date()
    };
    
    await updateDoc(productRef, dataWithTimestamp);
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update only the stock of a product
 * @param {string} id - The ID of the product
 * @param {number} newStock - The new stock level
 * @returns {Promise<void>}
 */
export const updateProductStock = async (id, newStock) => {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    
    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error(`Error updating stock for product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 * @param {string} id - The ID of the product to delete
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get products by category
 * @param {string} category - The category to filter by
 * @returns {Promise<Array>} - Array of products in the specified category
 */
export const getProductsByCategory = async (category) => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where('category', '==', category)
    );
    
    const productsSnapshot = await getDocs(q);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};

// Export all functions as a service object
const productService = {
  getAllProducts,
  getLowStockProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getProductsByCategory
};

export default productService;