// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock data for dashboard demonstration
  const [stats, setStats] = useState({
    totalProducts: 24,
    lowStockProducts: 6,
    totalOrders: 18,
    recentOrders: [
      {
        id: '1',
        customerName: 'John Smith',
        createdAt: new Date('2025-05-01'),
        items: [{ id: '1' }, { id: '2' }],
        total: 149.99,
        status: 'completed'
      },
      {
        id: '2',
        customerName: 'Sarah Johnson',
        createdAt: new Date('2025-05-03'),
        items: [{ id: '3' }],
        total: 79.50,
        status: 'pending'
      },
      {
        id: '3',
        customerName: 'Mike Anderson',
        createdAt: new Date('2025-05-05'),
        items: [{ id: '4' }, { id: '5' }, { id: '6' }],
        total: 237.75,
        status: 'completed'
      }
    ]
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
          <p className="text-3xl font-bold text-indigo-500 mt-2">{stats.totalProducts}</p>
          <Link to="/inventory" className="text-sm text-indigo-500 mt-2 inline-block hover:underline">
            View all products
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-700">Low Stock Products</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">{stats.lowStockProducts}</p>
          <Link to="/inventory" className="text-sm text-red-500 mt-2 inline-block hover:underline">
            View low stock
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">{stats.totalOrders}</p>
          <Link to="/orders" className="text-sm text-green-500 mt-2 inline-block hover:underline">
            View all orders
          </Link>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link to="/orders" className="text-indigo-500 hover:underline">
            View all
          </Link>
        </div>
        
        {stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{order.customerName}</td>
                    <td className="p-3">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                    <td className="p-3">{order.items.length}</td>
                    <td className="p-3">${order.total.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;