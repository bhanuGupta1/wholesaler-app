// src/utils/imageUtils.js

export const generateProductImageUrl = (product) => {
  // Example: generate a placeholder image URL
  return `https://via.placeholder.com/150?text=${encodeURIComponent(product.name || "Product")}`;
};
