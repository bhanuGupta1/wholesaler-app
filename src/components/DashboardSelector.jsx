// src/components/DashboardSelector.jsx - Updated with GuestDashboard
import { useAuth } from "../hooks/useAuth";
import Dashboard from "../pages/Dashboard";
import EnhancedDashboard from "../pages/EnhancedDashboard";
import GuestDashboard from "../pages/GuestDashboard";
import { useState, useEffect } from "react";

const DashboardSelector = () => {
  const { user } = useAuth();
  const [dashboardType, setDashboardType] = useState("guest"); // Default to guest view

  // Determine dashboard based on user role
  useEffect(() => {
    if (!user) {
      // No user logged in, show guest dashboard
      setDashboardType("guest");
    } else if (user?.role === "admin" || user?.role === "manager") {
      // Admin or manager gets enhanced dashboard
      setDashboardType("enhanced");
    } else {
      // Regular users get the original dashboard
      setDashboardType("regular");
    }

    // Check for URL param override for testing purposes
    const urlParams = new URLSearchParams(window.location.search);
    const dashboardParam = urlParams.get("dashboard");
    if (
      dashboardParam === "enhanced" ||
      dashboardParam === "regular" ||
      dashboardParam === "guest"
    ) {
      setDashboardType(dashboardParam);
    }
  }, [user]);

  // Manual dashboard switcher for development/testing purposes
  const toggleDashboard = () => {
    if (dashboardType === "enhanced") {
      setDashboardType("regular");
    } else if (dashboardType === "regular") {
      setDashboardType("guest");
    } else {
      setDashboardType("enhanced");
    }
  };

  return (
    <div>
      {/* Optional dashboard switcher button (can be removed in production) */}
      <div className="flex justify-end mb-4">
        <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
              Current view:
            </span>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mr-2">
              {dashboardType === "enhanced"
                ? "Admin Dashboard"
                : dashboardType === "regular"
                  ? "User Dashboard"
                  : "Guest View"}
            </span>
            <button
              onClick={toggleDashboard}
              className="ml-2 px-3 py-1 text-xs text-white bg-indigo-600 rounded-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Switch View
            </button>
          </div>
        </div>
      </div>

      {/* Render the appropriate dashboard */}
      {dashboardType === "enhanced" && <EnhancedDashboard />}
      {dashboardType === "regular" && <Dashboard />}
      {dashboardType === "guest" && <GuestDashboard />}
    </div>
  );
};

export default DashboardSelector;
