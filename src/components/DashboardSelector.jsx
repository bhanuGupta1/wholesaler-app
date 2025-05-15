// src/components/DashboardSelector.jsx
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../pages/Dashboard';
import EnhancedDashboard from '../pages/EnhancedDashboard';
import { useState, useEffect } from 'react';

const DashboardSelector = () => {
  const { user } = useAuth();
  const [dashboardType, setDashboardType] = useState('regular');

  // Determine dashboard based on user role
  useEffect(() => {
    // If user has admin or manager role, show enhanced dashboard
    if (user?.role === 'admin' || user?.role === 'manager') {
      setDashboardType('enhanced');
    } else {
      setDashboardType('regular');
    }

    // Check for URL param override for testing purposes
    const urlParams = new URLSearchParams(window.location.search);
    const dashboardParam = urlParams.get('dashboard');
    if (dashboardParam === 'enhanced' || dashboardParam === 'regular') {
      setDashboardType(dashboardParam);
    }
  }, [user]);

  // Manual dashboard switcher for testing/demo purposes
  const toggleDashboard = () => {
    setDashboardType(dashboardType === 'enhanced' ? 'regular' : 'enhanced');
  };

  return (
    <div>
      {/* Optional dashboard switcher button for testing */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleDashboard}
          className="px-3 py-1 text-xs text-white bg-indigo-600 rounded-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Switch to {dashboardType === 'enhanced' ? 'Regular' : 'Enhanced'} Dashboard
        </button>
      </div>

      {/* Render the appropriate dashboard */}
      {dashboardType === 'enhanced' ? <EnhancedDashboard /> : <Dashboard />}
    </div>
  );
};

export default DashboardSelector;