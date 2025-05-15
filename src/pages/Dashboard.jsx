// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome {currentUser?.displayName || currentUser?.email}!</p>
      
      <div className="dashboard-content">
        <div className="card">
          <h3>Orders</h3>
          <p>You have no pending orders.</p>
        </div>
        
        <div className="card">
          <h3>Inventory</h3>
          <p>You have no products in your inventory.</p>
        </div>
        
        <div className="card">
          <h3>Quick Actions</h3>
          <button>Create Order</button>
          <button>Add Product</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;