// src/pages/UserDashboard.jsx - ENHANCED: Fully integrated with new theme system
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";

const UserDashboard = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    myOrders: [],
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ENHANCED: Get theme classes for consistent styling
  const getThemeClasses = () => ({
    // Enhanced Buttons with premium effects
    btnPrimary: darkMode
      ? "cyber-btn cyber-btn-primary"
      : "neumorph-btn neumorph-btn-primary neon-border",
    btnSecondary: darkMode
      ? "cyber-btn cyber-btn-secondary"
      : "neumorph-btn neumorph-btn-secondary neumorph-elevated",
    btnOutline: darkMode
      ? "cyber-btn cyber-btn-outline"
      : "neumorph-btn neumorph-btn-outline neumorph-subtle",
    btnGhost: darkMode
      ? "cyber-btn cyber-btn-ghost"
      : "neumorph-btn neumorph-btn-ghost neumorph-breathing",
    btnSuccess: darkMode
      ? "cyber-btn cyber-btn-success"
      : "neumorph-btn neumorph-btn-success neumorph-elevated",

    // Enhanced Cards with premium glass effects
    card: darkMode ? "cyber-card" : "neumorph-card neumorph-breathing",
    cardGlow: darkMode ? "card-glow" : "neumorph-card-glow",
    featureCard: darkMode
      ? "feature-card"
      : "neumorph-feature-card neumorph-elevated",

    // Enhanced Text with advanced effects
    title: darkMode ? "cyberpunk-title" : "neumorph-title",
    titleGlow: darkMode ? "cyber-glow" : "neumorph-text-shadow",
    titleEmbossed: darkMode ? "cyber-glow" : "neumorph-embossed",
    gradientText: darkMode ? "holographic-text" : "neumorph-gradient-text",
    description: darkMode
      ? "text-gray-300"
      : "text-gray-600 neumorph-text-shadow",

    // Enhanced Text colors with premium effects
    textPrimary: darkMode ? "text-cyan-400" : "text-blue-600",
    textSecondary: darkMode ? "text-purple-400" : "text-purple-600",
    textAccent: darkMode ? "text-yellow-400" : "text-green-600",
    textMuted: darkMode ? "text-gray-400" : "text-gray-500",
    textBase: darkMode ? "text-gray-200" : "text-gray-900",

    // Enhanced Containers with glass morphism
    container: "relative z-1",
    section: "py-12 relative z-1",
    glassContainer: darkMode
      ? "bg-black/80 backdrop-blur-15"
      : "neumorph-glass-strong neumorph-elevated",
    premiumContainer: darkMode
      ? "bg-black/90 backdrop-blur-20"
      : "neumorph-holographic neumorph-elevated",

    // Enhanced stats cards
    statsCard: darkMode
      ? "cyber-card border-cyan-900/30"
      : "neumorph-card neumorph-subtle neumorph-breathing",

    // Enhanced loading effects
    loadingContainer: darkMode
      ? "bg-black/90 backdrop-blur-20"
      : "neumorph-glass-strong neumorph-breathing",
    loadingSpinner: darkMode
      ? "cyber-loading-spinner"
      : "neumorph-loading-spinner",

    // Enhanced dashboard and main cards
    dashboardCard: darkMode
      ? "cyber-dashboard-card"
      : "neumorph-dashboard-card neumorph-breathing",
    mainCard: darkMode
      ? "cyber-card border-cyan-900/30"
      : "neumorph-card neumorph-elevated neumorph-breathing",
  });

  const theme = getThemeClasses();

  useEffect(() => {
    async function fetchUserData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch only user's orders using simple queries (avoiding orderBy to prevent index issues)
        const ordersRef = collection(db, "orders");
        let userOrders = [];

        // Try primary filter: by userId (without orderBy to avoid index requirements)
        try {
          const userOrdersQuery = query(
            ordersRef,
            where("userId", "==", user.uid),
            limit(50), // Reasonable limit for user orders
          );

          const ordersSnapshot = await getDocs(userOrdersQuery);
          userOrders = ordersSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              customerName: data.customerName || user.displayName || "You",
              total: data.total || 0,
              status: data.status || "pending",
              items: data.items || [],
              itemCount: data.itemCount || (data.items ? data.items.length : 0),
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
              userId: data.userId,
              userEmail: data.userEmail,
            };
          });
        } catch (userIdError) {
          userOrders = [];
        }

        // If no orders found by userId, try filtering by userEmail as fallback
        if (userOrders.length === 0 && user.email) {
          try {
            const emailOrdersQuery = query(
              ordersRef,
              where("userEmail", "==", user.email),
              limit(50),
            );

            const ordersSnapshot = await getDocs(emailOrdersQuery);
            userOrders = ordersSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                customerName: data.customerName || user.displayName || "You",
                total: data.total || 0,
                status: data.status || "pending",
                items: data.items || [],
                itemCount:
                  data.itemCount || (data.items ? data.items.length : 0),
                createdAt: data.createdAt
                  ? data.createdAt.toDate()
                  : new Date(),
                userId: data.userId,
                userEmail: data.userEmail,
              };
            });
          } catch (emailError) {
            userOrders = [];
          }
        }

        // If still no orders found, try getting all orders and filter client-side (as last resort)
        if (userOrders.length === 0) {
          try {
            const allOrdersSnapshot = await getDocs(ordersRef);
            const allOrders = allOrdersSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                customerName: data.customerName || "Unknown",
                total: data.total || 0,
                status: data.status || "pending",
                items: data.items || [],
                itemCount:
                  data.itemCount || (data.items ? data.items.length : 0),
                createdAt: data.createdAt
                  ? data.createdAt.toDate()
                  : new Date(),
                userId: data.userId,
                userEmail: data.userEmail,
              };
            });

            // Filter client-side for user's orders
            userOrders = allOrders.filter(
              (order) =>
                order.userId === user.uid ||
                order.userEmail === user.email ||
                (order.customerName &&
                  order.customerName
                    .toLowerCase()
                    .includes(user.email?.split("@")[0]?.toLowerCase() || "")),
            );
          } catch (allOrdersError) {
            // This is fine - just means no orders collection exists or no permissions
            userOrders = [];
          }
        }

        // Sort orders by date (client-side since we avoided orderBy in queries)
        userOrders.sort((a, b) => b.createdAt - a.createdAt);

        // Calculate user statistics from real orders only
        const totalSpent = userOrders.reduce(
          (sum, order) => sum + order.total,
          0,
        );
        const pendingOrders = userOrders.filter(
          (order) => order.status === "pending",
        ).length;
        const completedOrders = userOrders.filter(
          (order) => order.status === "completed",
        ).length;

        setUserStats({
          myOrders: userOrders,
          totalOrders: userOrders.length,
          totalSpent,
          pendingOrders,
          completedOrders,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        // Don't show error for empty results - just show empty state
        setUserStats({
          myOrders: [],
          totalOrders: 0,
          totalSpent: 0,
          pendingOrders: 0,
          completedOrders: 0,
        });
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* ENHANCED: Premium loading with advanced glass morphism */}
        <div
          className={`relative z-10 text-center max-w-2xl mx-auto px-4 ${!darkMode ? "p-16 rounded-3xl neumorph-glass-strong neumorph-elevated neumorph-breathing" : ""}`}
        >
          {/* ENHANCED: Add quantum glow effect for light mode */}
          {!darkMode && <div className="neumorph-card-glow"></div>}

          <div className={`${theme.loadingSpinner} mb-8 mx-auto`}></div>
          <h1 className={`text-4xl font-bold mb-6 ${theme.title}`}>
            <span className={`${theme.textPrimary} ${theme.titleEmbossed}`}>
              {darkMode ? "LOADING" : "LOADING"}
            </span>
            <br />
            <span className={`${theme.textSecondary} ${theme.gradientText}`}>
              {darkMode ? "DASHBOARD" : "DASHBOARD"}
            </span>
          </h1>
          <div className={`${theme.gradientText} text-lg`}>
            {darkMode
              ? "Accessing neural interface..."
              : "Preparing your tactical command center..."}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 ${theme.textBase}`}>
        <div
          className={`text-center py-12 ${theme.mainCard} max-w-2xl mx-auto`}
        >
          {darkMode ? (
            <div className="card-glow"></div>
          ) : (
            <div className="neumorph-card-glow"></div>
          )}
          <div className="relative z-10">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className={`text-2xl font-bold mb-4 ${theme.title}`}>
              <span
                className={`${darkMode ? "text-red-400" : "text-red-600"} ${theme.titleEmbossed}`}
              >
                {darkMode ? "SYSTEM ERROR" : "SYSTEM ERROR"}
              </span>
            </h2>
            <p className={`${darkMode ? "text-red-300" : "text-red-600"} mb-6`}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={theme.btnPrimary}
            >
              <span className={darkMode ? "btn-text" : "neumorph-btn-text"}>
                Retry Connection
              </span>
              {darkMode ? (
                <div className="btn-glow"></div>
              ) : (
                <div className="neumorph-btn-glow"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-8 ${theme.textBase}`}>
        <div
          className={`text-center py-12 ${theme.mainCard} max-w-2xl mx-auto`}
        >
          {darkMode ? (
            <div className="card-glow"></div>
          ) : (
            <div className="neumorph-card-glow"></div>
          )}
          <div className="relative z-10">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className={`text-2xl font-bold mb-4 ${theme.title}`}>
              <span className={`${theme.textPrimary} ${theme.titleEmbossed}`}>
                {darkMode ? "ACCESS DENIED" : "ACCESS REQUIRED"}
              </span>
            </h2>
            <p className={`${theme.description} mb-6`}>
              {darkMode
                ? "Neural authentication required to access dashboard."
                : "Please authenticate to access your tactical command center."}
            </p>
            <Link to="/login" className={theme.btnPrimary}>
              <span className={darkMode ? "btn-text" : "neumorph-btn-text"}>
                {darkMode ? "Initialize Login" : "Authenticate"}
              </span>
              {darkMode ? (
                <div className="btn-glow"></div>
              ) : (
                <div className="neumorph-btn-glow"></div>
              )}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${theme.textBase}`}>
      {/* ENHANCED: Welcome Header with Premium Effects */}
      <div
        className={`mb-12 ${theme.premiumContainer} ${!darkMode ? "p-8 rounded-3xl" : ""}`}
      >
        {!darkMode && <div className="neumorph-cta-glow"></div>}
        <div className="relative z-10">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme.title}`}>
            <span className={`${theme.textPrimary} ${theme.titleEmbossed}`}>
              {darkMode ? "WELCOME BACK," : "WELCOME BACK,"}
            </span>
            <br />
            <span
              className={`${theme.textSecondary} ${theme.gradientText}`}
              data-text={
                user?.displayName || user?.email?.split("@")[0] || "OPERATOR"
              }
            >
              {user?.displayName || user?.email?.split("@")[0] || "OPERATOR"}
            </span>
          </h1>
          <p className={`text-xl ${theme.description}`}>
            {darkMode
              ? "Neural interface active. Your personal command center is online."
              : "Tactical command center operational. Your enhanced dashboard is fully armed and ready for deployment."}
          </p>
        </div>
      </div>

      {/* ENHANCED: User Stats Cards with Premium Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          {
            title: "Total Orders",
            value: userStats.totalOrders,
            icon: "📋",
            color: darkMode ? "text-cyan-400" : "text-blue-600",
            bgColor: darkMode ? "bg-cyan-900/30" : "bg-blue-100",
            description: darkMode ? "Combat missions" : "Tactical operations",
          },
          {
            title: "Total Spent",
            value: `$${userStats.totalSpent.toFixed(2)}`,
            icon: "💰",
            color: darkMode ? "text-green-400" : "text-green-600",
            bgColor: darkMode ? "bg-green-900/30" : "bg-green-100",
            description: darkMode ? "Credits invested" : "Capital deployed",
          },
          {
            title: "Pending Orders",
            value: userStats.pendingOrders,
            icon: "⏳",
            color: darkMode ? "text-yellow-400" : "text-yellow-600",
            bgColor: darkMode ? "bg-yellow-900/30" : "bg-yellow-100",
            description: darkMode ? "In processing" : "Active missions",
          },
          {
            title: "Completed",
            value: userStats.completedOrders,
            icon: "✅",
            color: darkMode ? "text-purple-400" : "text-purple-600",
            bgColor: darkMode ? "bg-purple-900/30" : "bg-purple-100",
            description: darkMode ? "Successful ops" : "Mission success",
          },
        ].map((stat, index) => (
          <div key={index} className={`${theme.statsCard} p-8`}>
            {darkMode ? (
              <div className="card-glow"></div>
            ) : (
              <div className="neumorph-card-glow"></div>
            )}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`text-4xl p-4 rounded-2xl ${stat.bgColor} ${!darkMode ? "neumorph-subtle" : ""}`}
                >
                  {stat.icon}
                </div>
                <div className="text-right">
                  <p
                    className={`text-3xl font-bold ${stat.color} ${theme.titleEmbossed}`}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
              <div>
                <p
                  className={`text-sm ${theme.textMuted} uppercase tracking-wider font-semibold ${theme.title}`}
                >
                  {stat.title}
                </p>
                <p className={`text-xs ${theme.textMuted} mt-1`}>
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ENHANCED: Main Content Grid with Premium Glass */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ENHANCED: My Orders - Premium Glass Card */}
        <div className="lg:col-span-2">
          <div className={`${theme.mainCard} overflow-hidden`}>
            {darkMode ? (
              <div className="card-glow"></div>
            ) : (
              <div className="neumorph-card-glow"></div>
            )}
            <div className="relative z-10">
              <div
                className={`px-8 py-6 border-b ${darkMode ? "border-cyan-900/30" : "border-gray-200"} flex justify-between items-center`}
              >
                <h2 className={`text-2xl font-bold ${theme.title}`}>
                  <span
                    className={`${theme.textPrimary} ${theme.titleEmbossed}`}
                  >
                    {darkMode ? "RECENT MISSIONS" : "RECENT ORDERS"}
                  </span>
                </h2>
                {userStats.totalOrders > 5 && (
                  <Link
                    to="/orders"
                    className={`text-sm font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition-colors ${!darkMode ? "neumorph-text-shadow" : ""}`}
                  >
                    View All ({userStats.totalOrders}) →
                  </Link>
                )}
              </div>

              <div
                className={`divide-y ${darkMode ? "divide-cyan-900/30" : "divide-gray-200"}`}
              >
                {userStats.myOrders.length > 0 ? (
                  userStats.myOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className={`p-8 ${darkMode ? "hover:bg-cyan-900/10" : "hover:bg-blue-50/50"} transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3
                              className={`text-lg font-bold ${theme.textBase} ${theme.title}`}
                            >
                              {darkMode ? "Mission" : "Order"} #
                              {order.id.slice(0, 8)}
                            </h3>
                            <span
                              className={`ml-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                order.status === "completed"
                                  ? darkMode
                                    ? "bg-green-900/30 text-green-400 border border-green-600"
                                    : "bg-green-100 text-green-800 border border-green-300"
                                  : order.status === "pending"
                                    ? darkMode
                                      ? "bg-yellow-900/30 text-yellow-400 border border-yellow-600"
                                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                    : order.status === "processing"
                                      ? darkMode
                                        ? "bg-blue-900/30 text-blue-400 border border-blue-600"
                                        : "bg-blue-100 text-blue-800 border border-blue-300"
                                      : darkMode
                                        ? "bg-red-900/30 text-red-400 border border-red-600"
                                        : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div
                            className={`mt-2 text-sm ${theme.textMuted} ${!darkMode ? "neumorph-text-shadow" : ""}`}
                          >
                            {order.createdAt.toLocaleDateString()} •{" "}
                            {order.itemCount} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-xl font-bold ${theme.textBase} ${theme.titleEmbossed}`}
                          >
                            ${order.total.toFixed(2)}
                          </div>
                          <Link
                            to={`/orders/${order.id}`}
                            className={`text-sm ${theme.textSecondary} hover:${theme.textPrimary} font-medium transition-colors`}
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className={`text-6xl mb-6 ${theme.textMuted}`}>📦</div>
                    <h3
                      className={`text-xl font-bold ${theme.textBase} mb-3 ${theme.title}`}
                    >
                      {darkMode ? "NO MISSIONS DEPLOYED" : "NO ORDERS YET"}
                    </h3>
                    <p className={`${theme.description} mb-6`}>
                      {darkMode
                        ? "You have not initiated any missions yet. Begin operations to see your mission history here."
                        : "You haven't placed any orders yet. Start shopping to see your tactical orders here!"}
                    </p>
                    <Link to="/products" className={theme.btnPrimary}>
                      <span className="text-xl">🛒</span>
                      <span
                        className={darkMode ? "btn-text" : "neumorph-btn-text"}
                      >
                        {darkMode ? "Browse Arsenal" : "Browse Products"}
                      </span>
                      {darkMode ? (
                        <div className="btn-glow"></div>
                      ) : (
                        <div className="neumorph-btn-glow"></div>
                      )}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ENHANCED: Right Sidebar - Premium Effects */}
        <div className="space-y-8">
          {/* ENHANCED: Quick Actions with Premium Glass */}
          <div className={`${theme.mainCard}`}>
            {darkMode ? (
              <div className="card-glow"></div>
            ) : (
              <div className="neumorph-card-glow"></div>
            )}
            <div className="relative z-10">
              <div
                className={`px-8 py-6 border-b ${darkMode ? "border-cyan-900/30" : "border-gray-200"}`}
              >
                <h2 className={`text-xl font-bold ${theme.title}`}>
                  <span
                    className={`${theme.textPrimary} ${theme.titleEmbossed}`}
                  >
                    {darkMode ? "QUICK ACCESS" : "QUICK ACTIONS"}
                  </span>
                </h2>
              </div>
              <div className="p-8 space-y-4">
                <Link
                  to="/products"
                  className={`${theme.btnPrimary} w-full justify-center`}
                >
                  <span className="text-xl">🛒</span>
                  <span className={darkMode ? "btn-text" : "neumorph-btn-text"}>
                    {darkMode ? "Browse Arsenal" : "Browse Products"}
                  </span>
                  {darkMode ? (
                    <div className="btn-glow"></div>
                  ) : (
                    <div className="neumorph-btn-glow"></div>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className={`${theme.btnSecondary} w-full justify-center`}
                >
                  <span className="text-xl">🛍️</span>
                  <span className={darkMode ? "btn-text" : "neumorph-btn-text"}>
                    {darkMode ? "Command Cart" : "View Cart"}
                  </span>
                  {darkMode ? (
                    <div className="btn-glow"></div>
                  ) : (
                    <div className="neumorph-btn-glow"></div>
                  )}
                </Link>

                <Link
                  to="/orders"
                  className={`${theme.btnSuccess} w-full justify-center`}
                >
                  <span className="text-xl">📋</span>
                  <span className={darkMode ? "btn-text" : "neumorph-btn-text"}>
                    {darkMode ? "Mission History" : "My Orders"}
                  </span>
                  {darkMode ? (
                    <div className="btn-glow"></div>
                  ) : (
                    <div className="neumorph-btn-glow"></div>
                  )}
                </Link>

                <Link
                  to="/create-order"
                  className={`${theme.btnOutline} w-full justify-center`}
                >
                  <span className="text-xl">➕</span>
                  <span className={darkMode ? "btn-text" : "neumorph-btn-text"}>
                    {darkMode ? "Deploy Mission" : "New Order"}
                  </span>
                  {darkMode ? (
                    <div className="btn-glow"></div>
                  ) : (
                    <div className="neumorph-btn-glow"></div>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* ENHANCED: Account Summary with Premium Glass */}
          <div className={`${theme.mainCard}`}>
            {darkMode ? (
              <div className="card-glow"></div>
            ) : (
              <div className="neumorph-card-glow"></div>
            )}
            <div className="relative z-10">
              <div
                className={`px-8 py-6 border-b ${darkMode ? "border-cyan-900/30" : "border-gray-200"}`}
              >
                <h2 className={`text-xl font-bold ${theme.title}`}>
                  <span
                    className={`${theme.textPrimary} ${theme.titleEmbossed}`}
                  >
                    {darkMode ? "OPERATOR PROFILE" : "ACCOUNT SUMMARY"}
                  </span>
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div
                      className={`h-16 w-16 rounded-full ${darkMode ? "bg-cyan-900/30 border-2 border-cyan-600" : "bg-blue-100 border-2 border-blue-300 neumorph-subtle"} flex items-center justify-center text-xl font-bold ${theme.textPrimary}`}
                    >
                      {(user?.displayName || user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div
                        className={`font-bold text-lg ${theme.textBase} ${theme.titleEmbossed}`}
                      >
                        {user?.displayName ||
                          user?.email?.split("@")[0] ||
                          "User"}
                      </div>
                      <div className={`text-sm ${theme.textMuted}`}>
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`pt-6 border-t ${darkMode ? "border-cyan-900/30" : "border-gray-200"}`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm ${theme.textMuted} uppercase tracking-wider font-semibold`}
                        >
                          {darkMode ? "Operator Status" : "Account Status"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            darkMode
                              ? "bg-green-900/30 text-green-400 border border-green-600"
                              : "bg-green-100 text-green-800 border border-green-300"
                          }`}
                        >
                          {darkMode ? "ACTIVE" : "ACTIVE"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm ${theme.textMuted} uppercase tracking-wider font-semibold`}
                        >
                          {darkMode ? "Recruit Date" : "Member Since"}
                        </span>
                        <span
                          className={`text-sm ${theme.textBase} font-medium`}
                        >
                          {user?.metadata?.creationTime
                            ? new Date(user.metadata.creationTime).getFullYear()
                            : new Date().getFullYear()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm ${theme.textMuted} uppercase tracking-wider font-semibold`}
                        >
                          {darkMode ? "Security Level" : "User Role"}
                        </span>
                        <span
                          className={`text-sm ${theme.textBase} font-medium uppercase`}
                        >
                          {darkMode ? "CUSTOMER" : "CUSTOMER"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ENHANCED: Premium Tips Card with Holographic Effects */}
          <div
            className={`${darkMode ? "cyber-cta-card" : "neumorph-cta-card neumorph-holographic"} p-8`}
          >
            {darkMode ? (
              <div className="cta-glow"></div>
            ) : (
              <div className="neumorph-cta-glow"></div>
            )}
            <div className="relative z-10">
              <h3 className={`text-lg font-bold mb-4 ${theme.title}`}>
                <span className={`${theme.textAccent} ${theme.titleEmbossed}`}>
                  {darkMode ? "⚡ TACTICAL TIP" : "💡 SHOPPING TIP"}
                </span>
              </h3>
              <p className={`text-sm ${theme.description} mb-6`}>
                {darkMode
                  ? "Maximize your combat efficiency by deploying bulk orders! Many arsenal items offer tactical discounts for large-scale operations."
                  : "Save money by buying in bulk! Many of our products offer quantity discounts for larger orders."}
              </p>
              <Link
                to="/products"
                className={`text-sm font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}
              >
                {darkMode ? "Explore Arsenal →" : "Explore Bulk Pricing →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
