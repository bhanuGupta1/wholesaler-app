// Custom React Hook for Deal Management
// src/hooks/useDealManagement.js

import { useState, useEffect, useCallback } from 'react';
import { dealService } from '../firebase/dealService';
import { useAuth } from './useAuth';

export const useDealManagement = (options = {}) => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // Subscribe to real-time deals updates
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = dealService.subscribeToDeals(
      (dealsData, subscriptionError) => {
        if (subscriptionError) {
          console.error('Subscription error:', subscriptionError);
          setError(subscriptionError.message);
        } else {
          setDeals(dealsData || []);
          setError(null);
        }
        setLoading(false);
      },
      {
        sortBy: options.sortBy || 'expires',
        sortDirection: options.sortDirection || 'asc',
        status: options.status
      }
    );

    return unsubscribe;
  }, [user, options.sortBy, options.sortDirection, options.status]);

  // Load statistics
  useEffect(() => {
    const loadStatistics = async () => {
      if (!user) return;
      
      const result = await dealService.getDealStatistics();
      if (result.success) {
        setStatistics(result.statistics);
      } else {
        console.error('Failed to load statistics:', result.error);
      }
    };

    loadStatistics();
  }, [user]);

  // Create new deal
  const createDeal = useCallback(async (dealData) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    try {
      const result = await dealService.createDeal(dealData, user.uid);
      return result;
    } catch (error) {
      console.error('Error creating deal:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update deal
  const updateDeal = useCallback(async (dealId, updateData) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    try {
      const result = await dealService.updateDeal(dealId, updateData, user.uid);
      return result;
    } catch (error) {
      console.error('Error updating deal:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete deal
  const deleteDeal = useCallback(async (dealId) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setLoading(true);
    try {
      const result = await dealService.deleteDeal(dealId, user.uid);
      return result;
    } catch (error) {
      console.error('Error deleting deal:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Apply deal to order
  const applyDeal = useCallback(async (dealId, orderId, orderAmount) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await dealService.applyDealToOrder(dealId, orderId, orderAmount, user.uid);
      return result;
    } catch (error) {
      console.error('Error applying deal:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Search deals
  const searchDeals = useCallback(async (searchTerm, searchOptions = {}) => {
    try {
      const result = await dealService.searchDeals(searchTerm, searchOptions);
      return result;
    } catch (error) {
      console.error('Error searching deals:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Get deal analytics
  const getDealAnalytics = useCallback(async (dealId) => {
    try {
      const result = await dealService.getDealAnalytics(dealId);
      return result;
    } catch (error) {
      console.error('Error getting deal analytics:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Toggle deal status
  const toggleDealStatus = useCallback(async (dealId, currentStatus) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await dealService.updateDeal(
        dealId, 
        { isActive: !currentStatus }, 
        user.uid
      );
      return result;
    } catch (error) {
      console.error('Error toggling deal status:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Cleanup expired deals
  const cleanupExpiredDeals = useCallback(async () => {
    try {
      const result = await dealService.deactivateExpiredDeals();
      return result;
    } catch (error) {
      console.error('Error cleaning up expired deals:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    // Data
    deals,
    loading,
    error,
    statistics,
    
    // Actions
    createDeal,
    updateDeal,
    deleteDeal,
    applyDeal,
    searchDeals,
    getDealAnalytics,
    toggleDealStatus,
    cleanupExpiredDeals
  };
};