import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

const DealManagement = () => {
  const [deals, setDeals] = useState([]);
  const [newDeal, setNewDeal] = useState({ title: '', discount: '', expires: '' });
  const [loading, setLoading] = useState(false);

  const dealsRef = collection(db, 'deals');

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const q = query(dealsRef, orderBy('expires', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeals(data);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewDeal({ ...newDeal, [e.target.name]: e.target.value });
  };

  const addDeal = async () => {
    if (!newDeal.title || !newDeal.discount || !newDeal.expires) return;
    try {
      const docRef = await addDoc(dealsRef, {
        title: newDeal.title,
        discount: parseFloat(newDeal.discount),
        expires: Timestamp.fromDate(new Date(newDeal.expires)),
        createdAt: Timestamp.now()
      });
      setNewDeal({ title: '', discount: '', expires: '' });
      fetchDeals();
    } catch (error) {
      console.error('Error adding deal:', error);
    }
  };

  const deleteDeal = async (id) => {
    try {
      await deleteDoc(doc(db, 'deals', id));
      setDeals(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Deal Management</h1>

      {/* Add New Deal Form */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Deal</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Deal Title"
            value={newDeal.title}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount (%)"
            value={newDeal.discount}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="expires"
            value={newDeal.expires}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
        </div>
        <button
          onClick={addDeal}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Add Deal
        </button>
      </div>

      {/* Deal List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Active Deals</h2>
        {loading ? (
          <p className="text-gray-500">Loading deals...</p>
        ) : deals.length === 0 ? (
          <p className="text-gray-500">No deals available.</p>
        ) : (
          <ul className="space-y-3">
            {deals.map((deal) => (
              <li
                key={deal.id}
                className="flex justify-between items-center p-3 border rounded bg-gray-50 dark:bg-gray-700"
              >
                <div>
                  <p className="font-medium">{deal.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {deal.discount}% off • Expires on{' '}
                    {deal.expires?.toDate?.().toLocaleDateString() || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => deleteDeal(deal.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DealManagement;
