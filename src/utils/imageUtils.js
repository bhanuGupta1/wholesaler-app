// src/utils/imageUtils.js

/**
 * Generates a consistent placeholder image URL based on product attributes
 * 
 * @param {Object} product - Product data
 * @param {string} product.name - Product name
 * @param {string} product.category - Product category (optional)
 * @returns {string} Image URL
 */
export const generateProductImageUrl = (product) => {
  // Create a seed based on product name and category for consistency
  const seed = `${product.category || ''}-${product.name}`.replace(/\s+/g, '-').toLowerCase();
  
  // Different image styles based on category
  let imageService = 'https://picsum.photos';
  let width = 400;
  let height = 300;
  
  if (product.category) {
    // Customize dimensions or style based on category
    switch(product.category.toLowerCase()) {
      case 'electronics':
        width = 500; 
        height = 400;
        break;
      case 'furniture':
        width = 450;
        height = 350;
        break;
      case 'office supplies':
        width = 400;
        height = 300;
        break;
      case 'stationery':
        width = 350;
        height = 250;
        break;
      // Add more categories as needed
    }
  }
  
  // Return URL with seed for consistent image
  return `${imageService}/seed/${seed}/${width}/${height}`;
};