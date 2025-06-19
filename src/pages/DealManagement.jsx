// src/pages/DealManagement.jsx

import React, { useState } from 'react';

const DealManagement = () => {
  const [deals, setDeals] = useState([]);
  const [newDeal, setNewDeal] = useState({ title: '', discount: '', expires: '' });

  const handleInputChange = (e) => {
    setNewDeal({ ...newDeal, [e.target.name]: e.target.value });
  };

  const addDeal = () => {
    if (!newDeal.title || !newDeal.discount || !newDeal.expires) return;
    setDeals([...deals, { ...newDeal, id: Date.now() }]);
    setNewDeal({ title: '', discount: '', expires: '' });
  };

  const deleteDeal = (id) => {
    setDeals(deals.filter(deal => deal.id !== id));
  };

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
            placeholder="Expires On"
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
        {deals.length === 0 ? (
          <p className="text-gray-500">No deals added yet.</p>
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
                    {deal.discount}% off • Expires on {deal.expires}
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
