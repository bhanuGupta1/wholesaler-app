// src/services/dashboardService.js
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
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Constants
const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";
const ACTIVITIES_COLLECTION = "activities";
const METRICS_COLLECTION = "metrics";

/**
 * Fetch dashboard summary data (products, orders, activities)
 */
export const getDashboardSummary = async (
  lowStockThreshold = 10,
  itemLimit = 5,
) => {
  try {
    // Fetch Products
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const productsSnapshot = await getDocs(productsRef);
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate product stats
    const totalProducts = products.length;
    const lowStockProducts = products.filter(
      (product) => product.stock <= lowStockThreshold,
    ).length;

    // Fetch recent orders
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const recentOrdersQuery = query(
      ordersRef,
      orderBy("createdAt", "desc"),
      limit(itemLimit),
    );

    const ordersSnapshot = await getDocs(recentOrdersQuery);
    const recentOrders = ordersSnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt
        ? data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt)
        : new Date();

      return {
        id: doc.id,
        customerName: data.customerName || "Unknown Customer",
        createdAt,
        items: data.items || [],
        itemCount: data.itemCount || 0,
        total: data.total || 0,
        status: data.status || "pending",
      };
    });

    // Get total orders count
    const ordersCountSnapshot = await getDocs(
      collection(db, ORDERS_COLLECTION),
    );
    const totalOrders = ordersCountSnapshot.size;

    // Fetch recent activities
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const activitiesQuery = query(
      activitiesRef,
      orderBy("createdAt", "desc"),
      limit(itemLimit),
    );

    const activitiesSnapshot = await getDocs(activitiesQuery);
    const activities = activitiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const activityDate = data.createdAt
        ? data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt)
        : new Date();

      return {
        id: doc.id,
        type: data.type || "order",
        description: data.description || "Activity",
        time: getRelativeTime(activityDate),
        createdAt: activityDate,
      };
    });

    // Fetch metrics
    let metrics = null;
    try {
      const metricsDoc = await getDoc(doc(db, METRICS_COLLECTION, "current"));
      if (metricsDoc.exists()) {
        metrics = metricsDoc.data();
      }
    } catch (err) {
      console.log("Metrics data not available:", err);
    }

    return {
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        items: products.slice(0, itemLimit),
      },
      orders: {
        total: totalOrders,
        recent: recentOrders,
      },
      activities,
      metrics,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

/**
 * Setup real-time listeners for dashboard data
 * @returns {Function} Unsubscribe function for all listeners
 */
export const setupDashboardListeners = (callbacks, options = {}) => {
  const { onOrdersUpdate, onActivitiesUpdate, onMetricsUpdate } = callbacks;
  const { limit: itemLimit = 5 } = options;

  const unsubscribers = [];

  // Orders listener
  if (onOrdersUpdate) {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const recentOrdersQuery = query(
      ordersRef,
      orderBy("createdAt", "desc"),
      limit(itemLimit),
    );

    const unsubscribe = onSnapshot(
      recentOrdersQuery,
      (snapshot) => {
        const recentOrders = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt
            ? data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(data.createdAt)
            : new Date();

          return {
            id: doc.id,
            customerName: data.customerName || "Unknown Customer",
            createdAt,
            items: data.items || [],
            itemCount: data.itemCount || 0,
            total: data.total || 0,
            status: data.status || "pending",
          };
        });

        onOrdersUpdate(recentOrders);
      },
      (error) => {
        console.error("Error in orders listener:", error);
      },
    );

    unsubscribers.push(unsubscribe);
  }

  // Activities listener
  if (onActivitiesUpdate) {
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const activitiesQuery = query(
      activitiesRef,
      orderBy("createdAt", "desc"),
      limit(itemLimit),
    );

    const unsubscribe = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        const activities = snapshot.docs.map((doc) => {
          const data = doc.data();
          const activityDate = data.createdAt
            ? data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(data.createdAt)
            : new Date();

          return {
            id: doc.id,
            type: data.type || "order",
            description: data.description || "Activity",
            time: getRelativeTime(activityDate),
            createdAt: activityDate,
          };
        });

        onActivitiesUpdate(activities);
      },
      (error) => {
        console.error("Error in activities listener:", error);
      },
    );

    unsubscribers.push(unsubscribe);
  }

  // Metrics listener
  if (onMetricsUpdate) {
    const metricsRef = doc(db, METRICS_COLLECTION, "current");

    const unsubscribe = onSnapshot(
      metricsRef,
      (doc) => {
        if (doc.exists()) {
          onMetricsUpdate(doc.data());
        }
      },
      (error) => {
        console.error("Error in metrics listener:", error);
      },
    );

    unsubscribers.push(unsubscribe);
  }

  // Return a function to unsubscribe from all listeners
  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
};

/**
 * Get analytics data for charts
 */
export const getDashboardAnalytics = async () => {
  try {
    // Get orders for revenue data by month
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const ordersQuery = query(
      ordersRef,
      orderBy("createdAt", "desc"),
      limit(100), // Get enough orders to aggregate
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt:
        doc.data().createdAt instanceof Timestamp
          ? doc.data().createdAt.toDate()
          : new Date(doc.data().createdAt || Date.now()),
    }));

    // Get products for inventory data by category
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const productsSnapshot = await getDocs(productsRef);
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Aggregate orders by month for revenue data
    const revenueByMonth = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    orders.forEach((order) => {
      const month = months[order.createdAt.getMonth()];
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (order.total || 0);
    });

    // Format revenue data for chart
    const revenueData = Object.entries(revenueByMonth)
      .map(([month, total]) => ({
        month,
        revenue: Math.round(total),
      }))
      .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

    // Fill in missing months with zero values
    const currentMonth = new Date().getMonth();
    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth - i + 12) % 12; // Get the last 6 months
      const month = months[monthIndex];
      if (!revenueByMonth[month]) {
        revenueData.push({ month, revenue: 0 });
      }
    }

    // Sort by month
    revenueData.sort((a, b) => {
      const aIndex = months.indexOf(a.month);
      const bIndex = months.indexOf(b.month);
      const current = currentMonth;

      // Calculate distance from current month
      const aDist = (current - aIndex + 12) % 12;
      const bDist = (current - bIndex + 12) % 12;

      // Sort by distance (most recent first)
      return aDist - bDist;
    });

    // Only keep the most recent 6 months
    const recentRevenueData = revenueData.slice(0, 6).reverse();

    // Aggregate products by category
    const productsByCategory = {};

    products.forEach((product) => {
      const category = product.category || "Other";
      if (!productsByCategory[category]) {
        productsByCategory[category] = {
          count: 0,
          value: 0,
        };
      }

      productsByCategory[category].count += 1;
      productsByCategory[category].value +=
        (product.price || 0) * (product.stock || 0);
    });

    // Format inventory data for chart
    const inventoryData = Object.entries(productsByCategory).map(
      ([category, data]) => ({
        category,
        count: data.count,
        value: Math.round(data.value),
      }),
    );

    // Generate comparison data (mock data for now)
    const currentWeek = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
      day: `Day ${day}`,
      current: Math.round(Math.random() * 3000) + 2000,
      previous: Math.round(Math.random() * 3000) + 2000,
    }));

    return {
      revenue: recentRevenueData,
      inventory: inventoryData,
      comparison: currentWeek,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
};

/**
 * Add a mock activity to the database
 */
export const addActivity = async (activity) => {
  try {
    const activityData = {
      ...activity,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, ACTIVITIES_COLLECTION),
      activityData,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding activity:", error);
    throw error;
  }
};

/**
 * Get relative time string from date
 */
function getRelativeTime(date) {
  if (!date) return "Unknown";

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default {
  getDashboardSummary,
  setupDashboardListeners,
  getDashboardAnalytics,
  addActivity,
};
