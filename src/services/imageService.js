// src/services/imageService.js
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * Upload an image to Firebase Storage
 *
 * @param {File} file - The image file to upload
 * @param {string} folder - The storage folder path
 * @param {string} itemId - Optional item ID to organize storage
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadImage = async (file, folder = "images", itemId = null) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Create a unique filename
    const fileName = `${Date.now()}_${file.name}`;

    // Create storage path
    let storagePath;
    if (itemId) {
      storagePath = `${folder}/${itemId}/${fileName}`;
    } else {
      storagePath = `${folder}/${fileName}`;
    }

    const storageRef = ref(storage, storagePath);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Upload a product image to Firebase Storage
 *
 * @param {File} file - The image file to upload
 * @param {string} productId - The ID of the product
 * @returns {Promise<string>} - The download URL of the image
 */
export const uploadProductImage = async (file, productId) => {
  return uploadImage(file, "product-images", productId);
};

/**
 * Upload a user profile image to Firebase Storage
 *
 * @param {File} file - The image file to upload
 * @param {string} userId - The ID of the user
 * @returns {Promise<string>} - The download URL of the image
 */
export const uploadProfileImage = async (file, userId) => {
  return uploadImage(file, "profile-images", userId);
};

/**
 * Delete an image from Firebase Storage
 *
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageUrl) => {
  try {
    // Extract the storage path from the URL
    const storageRef = ref(storage, getStoragePathFromUrl(imageUrl));

    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

/**
 * Extract the storage path from a Firebase Storage URL
 *
 * @param {string} url - The Firebase Storage URL
 * @returns {string} - The storage path
 */
const getStoragePathFromUrl = (url) => {
  // This is a simplistic implementation and might need adjustment based on your Firebase setup
  try {
    // Extract the path after the domain and before the token
    const pathMatch = url.match(/\/o\/(.+?)(\?|$)/);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }
    throw new Error("Could not extract storage path from URL");
  } catch (error) {
    console.error("Error extracting storage path:", error);
    throw error;
  }
};

/**
 * Generate a placeholder image URL for products without images
 *
 * @param {Object} item - Item data with name and category
 * @returns {string} - Placeholder image URL
 */
export const generatePlaceholderImage = (item) => {
  const category = item?.category?.toLowerCase() || "product";
  const name = item?.name?.replace(/\s+/g, "-").toLowerCase() || "item";

  // Use placeholder.com service for clean placeholders
  return `https://via.placeholder.com/300x300?text=${category}+${name}`;
};

export default {
  uploadImage,
  uploadProductImage,
  uploadProfileImage,
  deleteImage,
  generatePlaceholderImage,
};
