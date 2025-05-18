import React from 'react';
// Importing date formatting function from date-fns
import { format } from 'date-fns';

const OrderTable = ({ orders }) => {
  // Here I check if there are no orders and show a message
  if (orders.length === 0) {
    return <div className="text-center py-8">No orders found</div>;
  }

  // Here I return the orders table UI
  return (
    // Main container with styling
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table headers */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>

        {/* Table body with dynamic data */}
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Here I map through the orders array to render each order row */}
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              
              {/* Order ID */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.orderId || `#ORD-${order.id.substring(0, 5)}`} {/* Fallback to partial Firestore ID */}
                </div>
              </td>

              {/* Customer Name */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{order.customerName}</div>
              </td>

              {/* Order Date */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {/* Format Firestore timestamp if available */}
                  {order.dateCreated ? format(new Date(order.dateCreated.toDate()), 'dd MMM yyyy') : '-'}
                </div>
              </td>

              {/* Order Status with colored badge */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800' // Default for unknown or error states
                }`}>
                  {order.status}
                </span>
              </td>

              {/* Item count */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.itemCount || '-'}
              </td>

              {/* Total amount */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${order.totalAmount?.toFixed(2) || '-'}
              </td>

              {/* Action buttons: View and Print */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                  // Redirect to order details page
                  onClick={() => window.location.href = `/orders/${order.id}`}
                >
                  View
                </button>
                <button 
                  className="text-gray-600 hover:text-gray-900"
                  // Open invoice print page in a new tab
                  onClick={() => window.open(`/generate-invoice/${order.id}`, '_blank')}
                >
                  Print
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default OrderTable;
