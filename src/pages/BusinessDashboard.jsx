// src/pages/BusinessDashboard.jsx
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const BusinessDashboard = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-3xl font-bold mb-6">Business Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className="text-xl font-semibold mb-4">Business Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-bold">$125,430</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Growth:</span>
              <span className="font-bold text-green-600">+15.3%</span>
            </div>
            <div className="flex justify-between">
              <span>Active Customers:</span>
              <span className="font-bold">1,247</span>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/orders" className="block w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
              View Orders
            </Link>
            <Link to="/inventory" className="block w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Manage Inventory
            </Link>
            <Link to="/create-order" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Create Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;