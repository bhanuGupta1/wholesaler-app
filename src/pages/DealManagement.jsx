// Updated Deal Management Component using the new service and hook
// src/pages/DealManagement.jsx

import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDealManagement } from '../hooks/useDealManagement';

const DealManagement = () => {
  const { darkMode } = useTheme();
  
  // State for form and UI
  const [newDeal, setNewDeal] = useState({ 
    title: '', 
    discount: '', 
    expires: '', 
    description: '',
    category: '',
    minPurchase: '',
    maxUses: '',
    isActive: true
  });
  const [editingDeal, setEditingDeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('expires');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedDealAnalytics, setSelectedDealAnalytics] = useState(null);

  // Use the custom hook
  const {
    deals,
    loading,
    error,
    statistics,
    createDeal,
    updateDeal,
    deleteDeal,
    toggleDealStatus,
    getDealAnalytics,
    cleanupExpiredDeals
  } = useDealManagement({ sortBy });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDeal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add new deal using the service
  const handleAddDeal = async () => {
    if (!newDeal.title || !newDeal.discount || !newDeal.expires) {
      alert('Please fill in all required fields');
      return;
    }

    const result = await createDeal(newDeal);
    
    if (result.success) {
      // Reset form
      setNewDeal({ 
        title: '', 
        discount: '', 
        expires: '', 
        description: '',
        category: '',
        minPurchase: '',
        maxUses: '',
        isActive: true
      });
      alert('Deal added successfully!');
    } else {
      alert(`Failed to add deal: ${result.error}`);
    }
  };

  // Handle deal update
  const handleUpdateDeal = async (dealId, updatedData) => {
    const result = await updateDeal(dealId, updatedData);
    
    if (result.success) {
      setEditingDeal(null);
      alert('Deal updated successfully!');
    } else {
      alert(`Failed to update deal: ${result.error}`);
    }
  };

  // Handle deal deletion
  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;
    
    const result = await deleteDeal(dealId);
    
    if (result.success) {
      alert('Deal deleted successfully!');
    } else {
      alert(`Failed to delete deal: ${result.error}`);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (dealId, currentStatus) => {
    const result = await toggleDealStatus(dealId, currentStatus);
    
    if (!result.success) {
      alert(`Failed to update deal status: ${result.error}`);
    }
  };

  // Handle analytics view
  const handleViewAnalytics = async (dealId) => {
    const result = await getDealAnalytics(dealId);
    
    if (result.success) {
      setSelectedDealAnalytics(result.analytics);
      setShowAnalytics(true);
    } else {
      alert(`Failed to load analytics: ${result.error}`);
    }
  };

  // Handle cleanup expired deals
  const handleCleanupExpired = async () => {
    if (!window.confirm('This will deactivate all expired deals. Continue?')) return;
    
    const result = await cleanupExpiredDeals();
    
    if (result.success) {
      alert(`${result.updated} expired deals were deactivated.`);
    } else {
      alert(`Failed to cleanup expired deals: ${result.error}`);
    }
  };

  // Filter and search deals (using useMemo for performance)
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (deal.description && deal.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const now = new Date();
      const isExpired = deal.expires < now;
      
      let matchesFilter = true;
      if (filterStatus === 'active') {
        matchesFilter = deal.isActive && !isExpired;
      } else if (filterStatus === 'expired') {
        matchesFilter = isExpired;
      } else if (filterStatus === 'inactive') {
        matchesFilter = !deal.isActive;
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [deals, searchTerm, filterStatus]);

  // Utility functions
  const isDealExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (deal) => {
    if (isDealExpired(deal.expires)) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (!deal.isActive) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getStatusText = (deal) => {
    if (isDealExpired(deal.expires)) return 'Expired';
    if (!deal.isActive) return 'Inactive';
    return 'Active';
  };

  // Show loading state
  if (loading && deals.length === 0) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading deals...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with Statistics */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Deal Management</h1>
          <div className="flex items-center space-x-4">
            {statistics && (
              <>
                <span className="text-sm">Total: {statistics.total}</span>
                <span className="text-sm">Active: {statistics.active}</span>
                <span className="text-sm">Inactive: {statistics.inactive}</span>
              </>
            )}
            <button
              onClick={handleCleanupExpired}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              Cleanup Expired
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className={`mb-8 p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Deals</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="expires">Sort by Expiry</option>
              <option value="createdAt">Sort by Created</option>
              <option value="title">Sort by Title</option>
              <option value="discount">Sort by Discount</option>
            </select>
            
            <div className="text-sm text-gray-500">
              Showing {filteredDeals.length} of {deals.length} deals
            </div>
          </div>

          {/* Add New Deal Form */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Add New Deal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                name="title"
                placeholder="Deal Title*"
                value={newDeal.title}
                onChange={handleInputChange}
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="number"
                name="discount"
                placeholder="Discount %*"
                value={newDeal.discount}
                onChange={handleInputChange}
                min="0"
                max="100"
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="date"
                name="expires"
                value={newDeal.expires}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={newDeal.category}
                onChange={handleInputChange}
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="number"
                name="minPurchase"
                placeholder="Min Purchase Amount"
                value={newDeal.minPurchase}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="number"
                name="maxUses"
                placeholder="Max Uses (optional)"
                value={newDeal.maxUses}
                onChange={handleInputChange}
                min="1"
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <textarea
              name="description"
              placeholder="Deal Description"
              value={newDeal.description}
              onChange={handleInputChange}
              rows={3}
              className={`mt-4 w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newDeal.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Active Deal</span>
              </label>
              
              <button
                onClick={handleAddDeal}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Adding...' : 'Add Deal'}
              </button>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map(deal => (
            <div 
              key={deal.id} 
              className={`p-6 rounded-lg shadow-sm border transition-all hover:shadow-md ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold truncate pr-2">{deal.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(deal)}`}>
                  {getStatusText(deal)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {deal.discount}% OFF
                </p>
                {deal.description && (
                  <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {deal.description}
                  </p>
                )}
                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Expires: {formatDate(deal.expires)}</p>
                  {deal.category && <p>Category: {deal.category}</p>}
                  {deal.minPurchase > 0 && <p>Min Purchase: ${deal.minPurchase}</p>}
                  {deal.maxUses && (
                    <p>Usage: {deal.currentUses || 0} / {deal.maxUses}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleStatus(deal.id, deal.isActive)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    deal.isActive 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {deal.isActive ? 'Deactivate' : 'Activate'}
                </button>
                
                <button
                  onClick={() => handleViewAnalytics(deal.id)}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 transition-colors"
                >
                  Analytics
                </button>
                
                <button
                  onClick={() => setEditingDeal(deal)}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 transition-colors"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => handleDeleteDeal(deal.id)}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl mb-2">No deals found</p>
            <p className="text-sm">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Create your first deal to get started'
              }
            </p>
          </div>
        )}

        {/* Edit Deal Modal */}
        {editingDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-md w-full rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-lg font-semibold mb-4">Edit Deal</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Deal Title"
                  value={editingDeal.title}
                  onChange={(e) => setEditingDeal({...editingDeal, title: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={editingDeal.discount}
                  onChange={(e) => setEditingDeal({...editingDeal, discount: e.target.value})}
                  min="0"
                  max="100"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <input
                  type="date"
                  value={editingDeal.expires instanceof Date ? editingDeal.expires.toISOString().split('T')[0] : editingDeal.expires}
                  onChange={(e) => setEditingDeal({...editingDeal, expires: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <textarea
                  placeholder="Description"
                  value={editingDeal.description || ''}
                  onChange={(e) => setEditingDeal({...editingDeal, description: e.target.value})}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setEditingDeal(null)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateDeal(editingDeal.id, editingDeal)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && selectedDealAnalytics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-2xl w-full rounded-lg p-6 max-h-96 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Deal Analytics</h3>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className={`px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  Close
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Total Uses</p>
                  <p className="text-2xl font-bold">{selectedDealAnalytics.totalUses}</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Total Discount Given</p>
                  <p className="text-2xl font-bold text-green-600">${selectedDealAnalytics.totalDiscount?.toFixed(2)}</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className="text-sm text-gray-500">Average Discount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${selectedDealAnalytics.totalUses > 0 ? (selectedDealAnalytics.totalDiscount / selectedDealAnalytics.totalUses).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
              
              {selectedDealAnalytics.usageRecords.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Usage</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedDealAnalytics.usageRecords.slice(0, 10).map((record, index) => (
                      <div key={index} className={`p-2 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p>Order: {record.orderId}</p>
                        <p>Discount: ${record.discountAmount?.toFixed(2)}</p>
                        <p>Date: {record.usedAt ? formatDate(record.usedAt) : 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealManagement;