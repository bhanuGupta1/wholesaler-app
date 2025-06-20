// src/pages/admin/AdminPanel.jsx - Simple admin dashboard
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const AdminPanel = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const adminTools = [
    {
      title: 'User Management',
      description: 'Approve, reject, and manage user accounts',
      href: '/admin/users',
      icon: '👥',
      color: 'blue'
    },
    {
      title: 'Pending Approvals',
      description: 'Review and approve business account applications',
      href: '/admin/approvals',
      icon: '⏳',
      color: 'yellow'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and permissions',
      href: '/admin/settings',
      icon: '⚙️',
      color: 'gray'
    },
    {
      title: 'Analytics',
      description: 'View system analytics and user metrics',
      href: '/admin/analytics',
      icon: '📊',
      color: 'green'
    },
    {
      title: 'Inventory Management',
      description: 'Manage products and inventory across the platform',
      href: '/inventory',
      icon: '📦',
      color: 'purple'
    },
    {
      title: 'Order Management',
      description: 'View and manage all orders in the system',
      href: '/orders',
      icon: '📋',
      color: 'indigo'
    }
  ];

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Admin Panel
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Welcome back, {user?.displayName || 'Admin'}. Manage your wholesale platform from here.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center">
            <div className="text-3xl mr-4">👤</div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Users
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                247
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center">
            <div className="text-3xl mr-4">⏳</div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Pending Approvals
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                12
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏢</div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Business Accounts
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                89
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Active Today
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                156
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool, index) => (
          <Link
            key={index}
            to={tool.href}
            className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 hover:bg-gray-50'} rounded-xl shadow-md border p-6 transition-colors hover:shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">{tool.icon}</div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {tool.title}
                  </h3>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {tool.description}
                </p>
                <div className={`inline-flex items-center text-sm font-medium ${
                  tool.color === 'blue' ? darkMode ? 'text-blue-400' : 'text-blue-600'
                  : tool.color === 'yellow' ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  : tool.color === 'green' ? darkMode ? 'text-green-400' : 'text-green-600'
                  : tool.color === 'purple' ? darkMode ? 'text-purple-400' : 'text-purple-600'
                  : tool.color === 'indigo' ? darkMode ? 'text-indigo-400' : 'text-indigo-600'
                  : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Access Tool
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { type: 'approval', message: 'New business account application from "Smith Electronics"', time: '2 minutes ago' },
              { type: 'user', message: 'User "john.doe@example.com" signed up', time: '15 minutes ago' },
              { type: 'order', message: 'Large order ($2,450) placed by "ABC Retail"', time: '1 hour ago' },
              { type: 'system', message: 'System backup completed successfully', time: '3 hours ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'approval' ? 'bg-yellow-500'
                  : activity.type === 'user' ? 'bg-blue-500'
                  : activity.type === 'order' ? 'bg-green-500'
                  : 'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {activity.message}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;