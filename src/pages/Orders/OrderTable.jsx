import React from "react";
import { format } from "date-fns";

// Component to display a table of orders
const OrderTable = ({ orders }) => {
  // Display a message when no orders are available
  if (orders.length === 0) {
    return <div className="text-center py-8">No orders found</div>;
  }

  // Render the table when there are orders
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table header */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table body with dynamic data */}
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              {/* Display Order ID or fallback format if missing */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {order.orderId || `#ORD-${order.id.substring(0, 5)}`}
                </div>
              </td>

              {/* Customer name */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {order.customerName}
                </div>
              </td>

              {/* Formatted order creation date */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {order.dateCreated
                    ? format(
                        new Date(order.dateCreated.toDate()),
                        "dd MMM yyyy",
                      )
                    : "-"}
                </div>
              </td>

              {/* Order status with color-coded badge */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.status}
                </span>
              </td>

              {/* Number of items in the order */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.itemCount || "-"}
              </td>

              {/* Total amount with currency formatting */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${order.totalAmount?.toFixed(2) || "-"}
              </td>

              {/* Action buttons: View order details or print invoice */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                  onClick={() => (window.location.href = `/orders/${order.id}`)}
                >
                  View
                </button>
                <button
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() =>
                    window.open(`/generate-invoice/${order.id}`, "_blank")
                  }
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
