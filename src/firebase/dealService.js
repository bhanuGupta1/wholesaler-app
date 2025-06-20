// Fixed and Enhanced Firebase Deal Service
// src/firebase/dealService.js

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  onSnapshot,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './config';

export class DealService {
  constructor() {
    this.dealsRef = collection(db, 'deals');
    this.dealsUsageRef = collection(db, 'deal_usage');
    this.activityRef = collection(db, 'deal_activity');
  }

  // FIXED: Step 1 - Basic CRUD with proper error handling
  async createDeal(dealData, userId) {
    try {
      this.validateDealData(dealData);
      
      const deal = {
        ...dealData,
        discount: parseFloat(dealData.discount),
        minPurchase: dealData.minPurchase ? parseFloat(dealData.minPurchase) : 0,
        maxUses: dealData.maxUses ? parseInt(dealData.maxUses) : null,
        currentUses: 0,
        isActive: dealData.isActive ?? true,
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        expires: Timestamp.fromDate(new Date(dealData.expires))
      };

      const docRef = await addDoc(this.dealsRef, deal);
      
      // Log the activity
      await this.logDealActivity(docRef.id, 'created', userId);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating deal:', error);
      return { success: false, error: error.message };
    }
  }

  // FIXED: Proper error handling for getDeals
  async getDeals(options = {}) {
    try {
      let q = query(this.dealsRef);
      
      // Add filters if provided
      if (options.status === 'active') {
        q = query(q, where('isActive', '==', true));
      } else if (options.status === 'inactive') {
        q = query(q, where('isActive', '==', false));
      }
      
      if (options.category) {
        q = query(q, where('category', '==', options.category));
      }
      
      // Add sorting
      const sortBy = options.sortBy || 'expires';
      const sortDirection = options.sortDirection || 'asc';
      q = query(q, orderBy(sortBy, sortDirection));
      
      // Add pagination
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }
      
      const snapshot = await getDocs(q);
      const deals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expires: doc.data().expires?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      return { success: true, deals };
    } catch (error) {
      console.error('Error fetching deals:', error);
      return { success: false, error: error.message };
    }
  }

  // FIXED: Better error handling for updates
  async updateDeal(dealId, updateData, userId) {
    try {
      const dealRef = doc(db, 'deals', dealId);
      
      // Handle date conversion if expires is being updated
      const updates = { ...updateData, updatedAt: Timestamp.now() };
      if (updateData.expires && typeof updateData.expires === 'string') {
        updates.expires = Timestamp.fromDate(new Date(updateData.expires));
      }
      
      await updateDoc(dealRef, updates);
      
      // Log the activity
      await this.logDealActivity(dealId, 'updated', userId, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating deal:', error);
      return { success: false, error: error.message };
    }
  }

  // FIXED: Better error handling for deletes
  async deleteDeal(dealId, userId) {
    try {
      // Use batch to delete deal and related data
      const batch = writeBatch(db);
      
      // Delete the deal
      const dealRef = doc(db, 'deals', dealId);
      batch.delete(dealRef);
      
      // Delete related usage records
      const usageQuery = query(this.dealsUsageRef, where('dealId', '==', dealId));
      const usageSnapshot = await getDocs(usageQuery);
      usageSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      // Log the activity
      await this.logDealActivity(dealId, 'deleted', userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting deal:', error);
      return { success: false, error: error.message };
    }
  }

  // FIXED: Step 2 - Real-time subscription with error handling
  subscribeToDeals(callback, options = {}) {
    try {
      let q = query(this.dealsRef);
      
      // Add sorting
      const sortBy = options.sortBy || 'expires';
      const sortDirection = options.sortDirection || 'asc';
      q = query(q, orderBy(sortBy, sortDirection));
      
      // Add filters
      if (options.status === 'active') {
        q = query(q, where('isActive', '==', true));
      }
      
      return onSnapshot(q, (snapshot) => {
        const deals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          expires: doc.data().expires?.toDate(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        callback(deals);
      }, (error) => {
        console.error('Error in deals subscription:', error);
        callback(null, error);
      });
    } catch (error) {
      console.error('Error setting up subscription:', error);
      callback(null, error);
    }
  }

  // FIXED: Step 3 - Proper deal application with validation
  async applyDealToOrder(dealId, orderId, orderAmount, userId) {
    try {
      // Get the deal document
      const dealRef = doc(db, 'deals', dealId);
      const dealDoc = await getDoc(dealRef); // FIXED: Use getDoc instead of getDocs
      
      if (!dealDoc.exists()) {
        return { success: false, error: 'Deal not found' };
      }
      
      const deal = dealDoc.data();
      
      // Validate deal usage
      const validation = this.validateDealUsage(deal, orderAmount);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // Calculate discount
      const discountAmount = (orderAmount * deal.discount) / 100;
      const finalAmount = orderAmount - discountAmount;
      
      // Use batch for atomic operations
      const batch = writeBatch(db);
      
      // Record deal usage
      const usageRef = doc(this.dealsUsageRef);
      batch.set(usageRef, {
        dealId,
        orderId,
        userId,
        originalAmount: orderAmount,
        discountAmount,
        finalAmount,
        usedAt: Timestamp.now()
      });
      
      // Update deal usage count
      batch.update(dealRef, {
        currentUses: (deal.currentUses || 0) + 1,
        updatedAt: Timestamp.now()
      });
      
      await batch.commit();
      
      // Log the activity
      await this.logDealActivity(dealId, 'applied', userId, { orderId, orderAmount });
      
      return {
        success: true,
        discountAmount,
        finalAmount,
        dealTitle: deal.title
      };
    } catch (error) {
      console.error('Error applying deal:', error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Deal usage validation
  validateDealUsage(deal, orderAmount) {
    // Check if deal is active
    if (!deal.isActive) {
      return { valid: false, error: 'Deal is not active' };
    }
    
    // Check if deal is expired
    const now = new Date();
    const expiryDate = deal.expires?.toDate() || new Date(deal.expires);
    if (expiryDate <= now) {
      return { valid: false, error: 'Deal has expired' };
    }
    
    // Check minimum purchase amount
    if (deal.minPurchase && orderAmount < deal.minPurchase) {
      return { 
        valid: false, 
        error: `Minimum purchase amount is $${deal.minPurchase}` 
      };
    }
    
    // Check maximum uses
    if (deal.maxUses && deal.currentUses >= deal.maxUses) {
      return { valid: false, error: 'Deal usage limit reached' };
    }
    
    return { valid: true };
  }

  // ENHANCED: Step 4 - Better validation
  validateDealData(dealData) {
    if (!dealData.title?.trim()) {
      throw new Error('Deal title is required');
    }
    
    if (!dealData.discount || dealData.discount < 0 || dealData.discount > 100) {
      throw new Error('Discount must be between 0 and 100');
    }
    
    if (!dealData.expires) {
      throw new Error('Expiry date is required');
    }
    
    const expiryDate = new Date(dealData.expires);
    if (expiryDate <= new Date()) {
      throw new Error('Expiry date must be in the future');
    }
    
    if (dealData.minPurchase && dealData.minPurchase < 0) {
      throw new Error('Minimum purchase amount cannot be negative');
    }
    
    if (dealData.maxUses && dealData.maxUses < 1) {
      throw new Error('Maximum uses must be at least 1');
    }
  }

  // ENHANCED: Better activity logging
  async logDealActivity(dealId, action, userId, metadata = {}) {
    try {
      await addDoc(this.activityRef, {
        dealId,
        action, // 'created', 'updated', 'deleted', 'applied', 'activated', 'deactivated'
        userId,
        metadata,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error logging deal activity:', error);
      // Don't throw here as it's not critical to the main operation
    }
  }

  // NEW: Get deal analytics
  async getDealAnalytics(dealId) {
    try {
      // Get usage count and data
      const usageQuery = query(this.dealsUsageRef, where('dealId', '==', dealId));
      const usageSnapshot = await getDocs(usageQuery);
      
      const usageRecords = usageSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        usedAt: doc.data().usedAt?.toDate()
      }));
      
      // Calculate totals
      const totalDiscount = usageRecords.reduce((sum, record) => sum + record.discountAmount, 0);
      const totalSavings = usageRecords.reduce((sum, record) => sum + record.discountAmount, 0);
      
      return {
        success: true,
        analytics: {
          totalUses: usageRecords.length,
          totalDiscount,
          totalSavings,
          usageRecords
        }
      };
    } catch (error) {
      console.error('Error getting deal analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Search functionality
  async searchDeals(searchTerm, options = {}) {
    try {
      // Note: Firestore doesn't support full-text search
      // This is a basic implementation - consider Algolia for production
      const q = query(this.dealsRef, limit(options.limit || 50));
      const snapshot = await getDocs(q);
      
      const allDeals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expires: doc.data().expires?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      // Client-side filtering
      const filteredDeals = allDeals.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deal.description && deal.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deal.category && deal.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return { success: true, deals: filteredDeals };
    } catch (error) {
      console.error('Error searching deals:', error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Get deal statistics
  async getDealStatistics() {
    try {
      const [totalCount, activeCount] = await Promise.all([
        getCountFromServer(query(this.dealsRef)),
        getCountFromServer(query(this.dealsRef, where('isActive', '==', true)))
      ]);
      
      return {
        success: true,
        statistics: {
          total: totalCount.data().count,
          active: activeCount.data().count,
          inactive: totalCount.data().count - activeCount.data().count
        }
      };
    } catch (error) {
      console.error('Error getting deal statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Cleanup expired deals
  async deactivateExpiredDeals() {
    try {
      const now = Timestamp.now();
      const expiredQuery = query(
        this.dealsRef,
        where('expires', '<', now),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(expiredQuery);
      
      if (snapshot.empty) {
        return { success: true, updated: 0 };
      }
      
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isActive: false,
          updatedAt: Timestamp.now(),
          deactivatedReason: 'expired'
        });
      });
      
      await batch.commit();
      
      return { success: true, updated: snapshot.docs.length };
    } catch (error) {
      console.error('Error deactivating expired deals:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const dealService = new DealService();