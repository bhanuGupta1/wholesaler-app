// src/firebase/productService.js - Enhanced with seller filtering
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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { generateProductImageUrl } from "../utils/imageUtils";

const PRODUCTS_COLLECTION = "products";

// Export the products collection reference - single source of truth
export const productsRef = collection(db, PRODUCTS_COLLECTION);

// Create a new product with owner tracking
export const createProduct = async (productData, userId) => {
  try {
    // Generate image URL if not provided
    if (!productData.imageUrl) {
      productData.imageUrl = generateProductImageUrl(productData);
    }

    // Add product to Firestore with timestamps and ownership
    const productRef = await addDoc(productsRef, {
      ...productData,
      createdBy: userId, // Track who created this product
      ownedBy: userId, // Track who owns this product
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return productRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Fetch a product by ID with ownership check
export const getProduct = async (
  productId,
  userId = null,
  userRole = "user",
) => {
  try {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));

    if (!productDoc.exists()) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const productData = productDoc.data();

    // Check if user has permission to view this product
    if (userId && userRole === "business" && productData.ownedBy !== userId) {
      throw new Error("You do not have permission to view this product");
    }

    return {
      id: productDoc.id,
      ...productData,
    };
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

// Update product with ownership verification
export const updateProduct = async (
  productId,
  productData,
  userId = null,
  userRole = "user",
) => {
  try {
    // First check if user has permission to update this product
    if (userId && userRole !== "admin" && userRole !== "manager") {
      const currentProduct = await getProduct(productId);
      if (currentProduct.ownedBy !== userId) {
        throw new Error("You do not have permission to update this product");
      }
    }

    // Re-generate image URL if product name or category changed and image is not provided
    if (productData.name || productData.category) {
      const currentProduct = await getProduct(productId);
      const newProduct = { ...currentProduct, ...productData };

      if (!productData.imageUrl) {
        productData.imageUrl = generateProductImageUrl(newProduct);
      }
    }

    // Update product document
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      ...productData,
      updatedAt: serverTimestamp(),
    });

    return productId;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product with ownership verification
export const deleteProduct = async (
  productId,
  userId = null,
  userRole = "user",
) => {
  try {
    // Check if user has permission to delete this product
    if (userId && userRole !== "admin" && userRole !== "manager") {
      const currentProduct = await getProduct(productId);
      if (currentProduct.ownedBy !== userId) {
        throw new Error("You do not have permission to delete this product");
      }
    }

    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Enhanced getProducts with user-specific filtering
export const getProducts = async (
  options = {},
  userId = null,
  userRole = "user",
) => {
  try {
    let productsQuery = productsRef;
    const constraints = [];

    // Apply ownership filter for business sellers
    if (userId && userRole === "business") {
      constraints.push(where("ownedBy", "==", userId));
    }

    // Apply category filter
    if (options.category) {
      constraints.push(where("category", "==", options.category));
    }

    // Apply price range filters
    if (options.minPrice !== undefined) {
      constraints.push(where("price", ">=", options.minPrice));
    }

    if (options.maxPrice !== undefined) {
      constraints.push(where("price", "<=", options.maxPrice));
    }

    // Filter in-stock products
    if (options.inStock === true) {
      constraints.push(where("stockQuantity", ">", 0));
    }

    // Apply sorting by specified field and direction
    const sortField = options.sortBy || "createdAt";
    const sortDirection = options.sortDirection || "desc";
    constraints.push(orderBy(sortField, sortDirection));

    // Apply result limit for pagination
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    // Construct Firestore query with constraints
    if (constraints.length > 0) {
      productsQuery = query(productsQuery, ...constraints);
    }

    // Execute query and collect results
    const querySnapshot = await getDocs(productsQuery);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

// Get all products for admin/manager view
export const getAllProducts = async (options = {}) => {
  return getProducts(options, null, "admin");
};

// Get products owned by specific user
export const getUserProducts = async (userId, options = {}) => {
  try {
    const constraints = [where("ownedBy", "==", userId)];

    // Apply additional filters
    if (options.category) {
      constraints.push(where("category", "==", options.category));
    }

    if (options.inStock === true) {
      constraints.push(where("stockQuantity", ">", 0));
    }

    // Apply sorting
    const sortField = options.sortBy || "createdAt";
    const sortDirection = options.sortDirection || "desc";
    constraints.push(orderBy(sortField, sortDirection));

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    const userProductsQuery = query(productsRef, ...constraints);
    const querySnapshot = await getDocs(userProductsQuery);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return products;
  } catch (error) {
    console.error("Error getting user products:", error);
    throw error;
  }
};

// Retrieve low-stock products with ownership filtering
export const getLowStockProducts = async (
  threshold = 5,
  userId = null,
  userRole = "user",
) => {
  try {
    let constraints = [
      where("stockQuantity", "<=", threshold),
      where("stockQuantity", ">", 0),
      orderBy("stockQuantity"),
    ];

    // Apply ownership filter for business sellers
    if (userId && userRole === "business") {
      constraints.unshift(where("ownedBy", "==", userId));
    }

    const q = query(productsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return products;
  } catch (error) {
    console.error("Error getting low stock products:", error);
    throw error;
  }
};

// Get product statistics for user
export const getProductStats = async (userId = null, userRole = "user") => {
  try {
    let products;

    if (userRole === "admin" || userRole === "manager") {
      products = await getAllProducts();
    } else if (userId) {
      products = await getUserProducts(userId);
    } else {
      return { totalProducts: 0, lowStockCount: 0, totalValue: 0 };
    }

    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => p.stockQuantity <= 5).length;
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.stockQuantity,
      0,
    );

    return {
      totalProducts,
      lowStockCount,
      totalValue,
      averagePrice: totalProducts > 0 ? totalValue / totalProducts : 0,
    };
  } catch (error) {
    console.error("Error getting product stats:", error);
    throw error;
  }
};

export default {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getAllProducts,
  getUserProducts,
  getLowStockProducts,
  getProductStats,
};
