// src/utils/imageManagement.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Upload a product image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} productId - The ID of the product
 * @returns {Promise<string>} - The download URL of the image
 */
export const uploadProductImage = async (file, productId) => {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `products/${productId}/${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update the product document with the image URL
    await updateDoc(doc(db, 'products', productId), {
      imageUrl: downloadURL,
      updatedAt: new Date()
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Generate a placeholder image URL for products without images
 * @param {Object} product - Product data
 * @returns {string} - Placeholder image URL
 */
export const generatePlaceholderImage = (product) => {
  const category = product?.category?.toLowerCase() || 'product';
  const name = product?.name?.replace(/\s+/g, '-').toLowerCase() || 'item';
  
  // Use placeholder.com service for clean placeholders
  return `https://via.placeholder.com/300x300?text=${category}+${name}`;
};

/**
 * Get the image URL for a product
 * @param {Object} product - The product object
 * @returns {string} - The image URL or a placeholder
 */
export const getProductImageUrl = (product) => {
  if (product?.imageUrl) {
    return product.imageUrl;
  }
  
  return generatePlaceholderImage(product);
};