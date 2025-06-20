// Enhanced Deal Management Component with Firebase Integration
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  query,
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const DealManagement = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  
  // State management
  const [deals, setDeals] = useState([]);
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
  const [loading, setLoading] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'expired'
  const [sortBy, setSortBy] = useState('expires');

  const dealsRef = collection(db, 'deals');

  // Real-time listener for deals
  useEffect(() => {
    const q = query(dealsRef, orderBy(sortBy, 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expires: doc.data().expires?.toDate?.() || new Date(doc.data().expires),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));
      
      setDeals(dealsData);
    }, (error) => {
      console.error('Error fetching deals:', error);
    });

    return () => unsubscribe();
  }, [sortBy]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDeal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add new deal
  const addDeal = async () => {
    if (!newDeal.title || !newDeal.discount || !newDeal.expires) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const dealData = {
        title: newDeal.title,
        description: newDeal.description,
        discount: parseFloat(newDeal.discount),
        expires: Timestamp.fromDate(new Date(newDeal.expires)),
        category: newDeal.category,
        minPurchase: newDeal.minPurchase ? parseFloat(newDeal.minPurchase) : 0,
        maxUses: newDeal.maxUses ? parseInt(newDeal.maxUses) : null,
        currentUses: 0,
        isActive: newDeal.isActive,
        createdBy: user?.uid || 'anonymous',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(dealsRef, dealData);
      
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
    } catch (error) {
      console.error('Error adding deal:', error);
      alert('Failed to add deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update deal
  const updateDeal = async (dealId, updatedData) => {
    setLoading(true);
    try {
      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, {
        ...updatedData,
        updatedAt: Timestamp.now()
      });
      
      setEditingDeal(null);
      alert('Deal updated successfully!');
    } catch (error) {
      console.error('Error updating deal:', error);
      alert('Failed to update deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete deal
  const deleteDeal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'deals', id));
      alert('Deal deleted successfully!');
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle deal status
  const toggleDealStatus = async (dealId, currentStatus) => {
    try {
      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, {
        isActive: !currentStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error toggling deal status:', error);
      alert('Failed to update deal status.');
    }
  };

  // Filter and search deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  // Check if deal is expired
  const isDealExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // Get deal status color
  const getStatusColor = (deal) => {
    if (isDealExpired(deal.expires)) return 'bg-red-100 text-red-800';
    if (!deal.isActive) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  // Get deal status text
  const getStatusText = (deal) => {
    if (isDealExpired(deal.expires)) return 'Expired';
    if (!deal.isActive) return 'Inactive';
    return 'Active';
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Deal Management</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Total Deals: {deals.length}</span>
            <span className="text-sm">Active: {deals.filter(d => d.isActive && !isDealExpired(d.expires)).length}</span>
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
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Deals</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value="expires">Sort by Expiry</option>
              <option value="createdAt">Sort by Created</option>
              <option value="title">Sort by Title</option>
              <option value="discount">Sort by Discount</option>
            </select>
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
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="number"
                name="discount"
                placeholder="Discount %*"
                value={newDeal.discount}
                onChange={handleInputChange}
                min="0"
                max="100"
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="date"
                name="expires"
                value={newDeal.expires}
                onChange={handleInputChange}
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={newDeal.category}
                onChange={handleInputChange}
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="number"
                name="minPurchase"
                placeholder="Min Purchase Amount"
                value={newDeal.minPurchase}
                onChange={handleInputChange}
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              
              <input
                type="number"
                name="maxUses"
                placeholder="Max Uses (optional)"
                value={newDeal.maxUses}
                onChange={handleInputChange}
                className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <textarea
              name="description"
              placeholder="Deal Description"
              value={newDeal.description}
              onChange={handleInputChange}
              rows={3}
              className={`mt-4 w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
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
                Active Deal
              </label>
              
              <button
                onClick={addDeal}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-semibold ${
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

        {/* Deals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map(deal => (
            <div 
              key={deal.id} 
              className={`p-6 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">{deal.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal)}`}>
                  {getStatusText(deal)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-2xl font-bold text-green-600">{deal.discount}% OFF</p>
                {deal.description && (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {deal.description}
                  </p>
                )}
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Expires: {formatDate(deal.expires)}</p>
                  {deal.category && <p>Category: {deal.category}</p>}
                  {deal.minPurchase > 0 && <p>Min Purchase: ${deal.minPurchase}</p>}
                  {deal.maxUses && (
                    <p>Usage: {deal.currentUses || 0} / {deal.maxUses}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleDealStatus(deal.id, deal.isActive)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                    deal.isActive 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {deal.isActive ? 'Deactivate' : 'Activate'}
                </button>
                
                <button
                  onClick={() => setEditingDeal(deal)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => deleteDeal(deal.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-xl">No deals found</p>
            <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealManagement;