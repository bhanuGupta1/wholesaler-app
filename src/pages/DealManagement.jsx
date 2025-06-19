// DealManagement.jsx - Admin Deal Management Component

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const DealManagement = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for demonstration
  const mockDeals = [
    {
      id: 'DEAL001',
      title: 'Bulk Electronics Purchase',
      client: 'TechCorp Solutions',
      value: 125000,
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-03-15',
      discount: 15,
      products: ['Laptops', 'Tablets', 'Accessories'],
      description: 'Large volume purchase agreement for corporate equipment'
    },
    {
      id: 'DEAL002',
      title: 'Office Furniture Package',
      client: 'ModernSpace Inc',
      value: 85000,
      status: 'pending',
      startDate: '2025-02-01',
      endDate: '2025-04-01',
      discount: 12,
      products: ['Desks', 'Chairs', 'Storage'],
      description: 'Complete office furniture solution for new headquarters'
    },
    {
      id: 'DEAL003',
      title: 'Seasonal Inventory Clear',
      client: 'RetailMax Group',
      value: 200000,
      status: 'completed',
      startDate: '2024-12-01',
      endDate: '2025-01-31',
      discount: 25,
      products: ['Winter Apparel', 'Holiday Items'],
      description: 'End-of-season inventory clearance deal'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDeals(mockDeals);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      active: darkMode ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100',
      pending: darkMode ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-100',
      completed: darkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-100',
      expired: darkMode ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-100'
    };
    return colors[status] || colors.pending;
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || deal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${
          darkMode ? 'border-cyan-400' : 'border-indigo-500'
        }`}></div>
        <p className={`ml-4 text-lg ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
          Loading deals...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${
              darkMode ? 'text-cyan-400 cyber-glow' : 'text-indigo-600'
            }`}>
              {darkMode ? 'DEAL NEXUS' : 'Deal Management'}
            </h1>
            <            <p className={`mt-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage wholesale deals, discounts, and client agreements
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? 'bg-cyan-600 hover:bg-cyan-500 text-black' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {darkMode ? '+ CREATE DEAL' : '+ Create New Deal'}
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className={`mb-6 p-4 rounded-lg ${
        darkMode ? 'bg-gray-800 border border-cyan-500/30' : 'bg-white border border-indigo-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-cyan-400' : 'text-indigo-600'
            }`}>
              Search Deals
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by deal title, client, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-cyan-500/50 text-white placeholder-gray-400 focus:border-cyan-400' 
                    : 'bg-white border-indigo-200 text-gray-900 placeholder-gray-500 focus:border-indigo-400'
                } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              />
              <svg className={`absolute left-3 top-2.5 h-5 w-5 ${
                darkMode ? 'text-cyan-400' : 'text-indigo-500'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter by Status */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-cyan-400' : 'text-indigo-600'
            }`}>
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-cyan-500/50 text-white focus:border-cyan-400' 
                  : 'bg-white border-indigo-200 text-gray-900 focus:border-indigo-400'
              } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Deals', value: deals.length, icon: '📋' },
          { label: 'Active Deals', value: deals.filter(d => d.status === 'active').length, icon: '✅' },
          { label: 'Total Value', value: formatCurrency(deals.reduce((sum, d) => sum + d.value, 0)), icon: '💰' },
          { label: 'Avg Discount', value: `${Math.round(deals.reduce((sum, d) => sum + d.discount, 0) / deals.length)}%`, icon: '🏷️' }
        ].map((stat, index) => (
          <div key={index} className={`p-6 rounded-lg transition-all duration-300 hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800 border border-cyan-500/30 hover:border-cyan-400' 
              : 'bg-white border border-indigo-200 hover:border-indigo-400 shadow-lg'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${
                  darkMode ? 'text-cyan-400' : 'text-indigo-600'
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deals Table */}
      <div className={`rounded-lg overflow-hidden ${
        darkMode ? 'bg-gray-800 border border-cyan-500/30' : 'bg-white border border-indigo-200 shadow-lg'
      }`}>
        <div className={`px-6 py-4 border-b ${
          darkMode ? 'border-cyan-500/30 bg-gray-700' : 'border-indigo-200 bg-indigo-50'
        }`}>
          <h2 className={`text-xl font-bold ${
            darkMode ? 'text-cyan-400' : 'text-indigo-600'
          }`}>
            {darkMode ? 'ACTIVE CONTRACTS' : 'Deals Overview'}
          </h2>
          <p className={`text-sm ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {filteredDeals.length} of {deals.length} deals shown
          </p>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-xl font-bold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No deals found
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-cyan-400' : 'text-indigo-600'
                  }`}>
                    Deal Info
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-cyan-400' : 'text-indigo-600'
                  }`}>
                    Client
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-cyan-400' : 'text-indigo-600'
                  }`}>
                    Value
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-cyan-400' : 'text-indigo-600'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-cyan-400' : 'text-indigo-600'
                  }`}>
                    Duration
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-cyan-400' : 'text-indigo-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className={`transition-all duration-300 hover:scale-[1.01] ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-indigo-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {deal.title}
                        </div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          ID: {deal.id}
                        </div>
                        <div className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-400'
                        }`}>
                          {deal.discount}% discount
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {deal.client}
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {deal.products.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${
                        darkMode ? 'text-cyan-400' : 'text-indigo-600'
                      }`}>
                        {formatCurrency(deal.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deal.status)}`}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {new Date(deal.startDate).toLocaleDateString()} - 
                        <br />
                        {new Date(deal.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                          darkMode 
                            ? 'text-cyan-400 hover:bg-cyan-900/30' 
                            : 'text-indigo-600 hover:bg-indigo-100'
                        }`}>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                          darkMode 
                            ? 'text-yellow-400 hover:bg-yellow-900/30' 
                            : 'text-yellow-600 hover:bg-yellow-100'
                        }`}>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                          darkMode 
                            ? 'text-red-400 hover:bg-red-900/30' 
                            : 'text-red-600 hover:bg-red-100'
                        }`}>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Deal Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`max-w-2xl w-full mx-4 p-6 rounded-xl ${
            darkMode ? 'bg-gray-800 border border-cyan-500/30' : 'bg-white border border-indigo-200'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-2xl font-bold ${
                darkMode ? 'text-cyan-400' : 'text-indigo-600'
              }`}>
                {darkMode ? 'CREATE NEW DEAL' : 'Create New Deal'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-100'
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className={`p-8 text-center rounded-lg ${
                darkMode ? 'bg-gray-700 border border-cyan-500/30' : 'bg-gray-50 border border-indigo-200'
              }`}>
                <div className="text-4xl mb-4">🚧</div>
                <h4 className={`text-lg font-semibold mb-2 ${
                  darkMode ? 'text-cyan-400' : 'text-indigo-600'
                }`}>
                  Deal Creation Form
                </h4>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  This feature is under development. The form will include fields for deal title, client information, products, discounts, and terms.
                </p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`mt-4 px-6 py-2 rounded-lg font-bold transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-black' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {darkMode ? 'UNDERSTOOD' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .cyber-glow {
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default DealManagement;