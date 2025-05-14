// src/firebase/productService.js
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
import { generateProductImageUrl } from '../utils/imageUtils';

const PRODUCTS_COLLECTION = 'products';

// Create a new product
export const createProduct = async (productData) => {
  try {
    // Generate image URL if not provided
    if (!productData.imageUrl) {
      productData.imageUrl = generateProductImageUrl(productData);
    }
    
    const productRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return productRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Get a product by ID
export const getProduct = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
    
    if (!productDoc.exists()) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    return {
      id: productDoc.id,
      ...productDoc.data()
    };
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (productId, productData) => {
  try {
    // Generate image URL if not provided but name or category changed
    if (productData.name || productData.category) {
      const currentProduct = await getProduct(productId);
      const newProduct = { ...currentProduct, ...productData };
      
      if (!productData.imageUrl) {
        productData.imageUrl = generateProductImageUrl(newProduct);
      }
    }
    
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      ...productData,
      updatedAt: serverTimestamp()
    });
    
    return productId;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get all products with optional filtering
export const getProducts = async (options = {}) => {
  try {
    let productsQuery = collection(db, PRODUCTS_COLLECTION);
    const constraints = [];
    
    // Apply filters
    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }
    
    if (options.minPrice !== undefined) {
      constraints.push(where('price', '>=', options.minPrice));
    }
    
    if (options.maxPrice !== undefined) {
      constraints.push(where('price', '<=', options.maxPrice));
    }
    
    if (options.inStock === true) {
      constraints.push(where('stockQuantity', '>', 0));
    }
    
    // Apply sorting
    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortDirection || 'desc';
    constraints.push(orderBy(sortField, sortDirection));
    
    // Apply pagination
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    
    // Execute query
    if (constraints.length > 0) {
      productsQuery = query(productsQuery, ...constraints);
    }
    
    const querySnapshot = await getDocs(productsQuery);
    
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Get low stock products
export const getLowStockProducts = async (threshold = 5) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('stockQuantity', '<=', threshold),
      where('stockQuantity', '>', 0),
      orderBy('stockQuantity')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
  } catch (error) {
    console.error('Error getting low stock products:', error);
    throw error;
  }
};