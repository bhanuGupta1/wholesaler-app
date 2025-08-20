// src/utils/categoryUtils.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

// Default categories if none are found in database
const DEFAULT_CATEGORIES = [
  "Electronics",
  "Office Supplies",
  "Furniture",
  "Kitchen",
  "Clothing",
  "Miscellaneous",
];

/**
 * Get all unique categories from products
 * @returns {Promise<Array>} Array of category strings
 */
export const getAllCategories = async () => {
  try {
    const productsRef = collection(db, "products");
    const productsSnapshot = await getDocs(productsRef);

    // Extract unique categories from products
    const categorySet = new Set();

    productsSnapshot.docs.forEach((doc) => {
      const category = doc.data().category;
      if (category) {
        categorySet.add(category);
      }
    });

    // Convert to array and sort alphabetically
    const categories = Array.from(categorySet).sort();

    // If no categories found, return defaults
    return categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return DEFAULT_CATEGORIES;
  }
};

/**
 * Get products count by category
 * @returns {Promise<Object>} Object with category names as keys and counts as values
 */
export const getCategoryCounts = async () => {
  try {
    const productsRef = collection(db, "products");
    const productsSnapshot = await getDocs(productsRef);

    // Count products by category
    const categoryCounts = {};

    productsSnapshot.docs.forEach((doc) => {
      const category = doc.data().category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    return categoryCounts;
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return {};
  }
};

/**
 * Get category stats (count, total value, average price, etc.)
 * @param {string} category - The category to get stats for
 * @returns {Promise<Object>} Object with category statistics
 */
export const getCategoryStats = async (category) => {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("category", "==", category));
    const productsSnapshot = await getDocs(q);

    if (productsSnapshot.empty) {
      return {
        count: 0,
        totalValue: 0,
        averagePrice: 0,
        lowestPrice: 0,
        highestPrice: 0,
        totalStock: 0,
        lowStockCount: 0,
      };
    }

    let totalValue = 0;
    let totalStock = 0;
    let lowStockCount = 0;
    let prices = [];

    productsSnapshot.docs.forEach((doc) => {
      const product = doc.data();
      const price = product.price || 0;
      const stock = product.stock || 0;
      const reorderPoint = product.reorderPoint || 10;

      totalValue += price * stock;
      totalStock += stock;
      prices.push(price);

      if (stock <= reorderPoint) {
        lowStockCount++;
      }
    });

    // Calculate stats
    const count = productsSnapshot.size;
    const averagePrice = count > 0 ? totalValue / totalStock : 0;
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      count,
      totalValue,
      averagePrice,
      lowestPrice,
      highestPrice,
      totalStock,
      lowStockCount,
    };
  } catch (error) {
    console.error(`Error fetching stats for category ${category}:`, error);
    return null;
  }
};

// Export utilities
const categoryUtils = {
  getAllCategories,
  getCategoryCounts,
  getCategoryStats,
  DEFAULT_CATEGORIES,
};

export default categoryUtils;
