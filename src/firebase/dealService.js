// Firebase Deal Services - Advanced Integration
// src/firebase/dealService.js

import {
  collection,
  addDoc,
  getDocs,
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
  }

  // Step 1: Basic CRUD
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
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getDeals() {
    const snapshot = await getDocs(this.dealsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateDeal(dealId, updateData) {
    const dealRef = doc(db, 'deals', dealId);
    await updateDoc(dealRef, { ...updateData, updatedAt: Timestamp.now() });
  }

  async deleteDeal(dealId) {
    const dealRef = doc(db, 'deals', dealId);
    await deleteDoc(dealRef);
  }


  async logDealActivity(dealId, action, userId) {
    const activityRef = collection(db, 'deal_activity');
    await addDoc(activityRef, {
      dealId,
      action,
      userId,
      timestamp: Timestamp.now()
    });
  }
}
