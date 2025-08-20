import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderWithItems } from "../../firebase/orderService"; // Import the service function
import { format } from "date-fns";

/**
 * OrderDetails Component - FIXED VERSION
 *
 * This component displays detailed information about a specific order,
 * including customer info, items in the order, and total price.
 */
const OrderDetails = () => {
  const { id } = useParams(); // Get order ID from route params
  const [order, setOrder] = useState(null); // State to store order details
  const [items, setItems] = useState([]); // State to store order items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the getOrderWithItems function from orderService
        const orderWithItems = await getOrderWithItems(id);

        console.log("Fetched order:", orderWithItems); // Debug log

        // Set the order and items from the service response
        setOrder(orderWithItems);
        setItems(orderWithItems.items || []);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // When data is being fetched, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-800">
            Error Loading Order
          </h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/orders" className="text-indigo-600 hover:text-indigo-900">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Show message if no order is found
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link to="/orders" className="text-indigo-600 hover:text-indigo-900">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to format date - handles both Firestore timestamp and regular date
  const formatOrderDate = (dateField) => {
    if (!dateField) return "-";

    try {
      // Handle Firestore timestamp
      if (dateField.toDate && typeof dateField.toDate === "function") {
        return format(dateField.toDate(), "dd MMM yyyy, hh:mm a");
      }
      // Handle regular Date object
      if (dateField instanceof Date) {
        return format(dateField, "dd MMM yyyy, hh:mm a");
      }
      // Handle string dates
      if (typeof dateField === "string") {
        return format(new Date(dateField), "dd MMM yyyy, hh:mm a");
      }
      return "-";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  // Main UI for styling and designing
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {order.orderId || `Order #${id.substring(0, 5)}`}
            </h1>
            <Link
              to="/orders"
              className="text-indigo-600 hover:text-indigo-900"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>

        {/* Order Info & Customer Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Info */}
          <div>
            <h2 className="text-lg font-medium mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.status || "pending"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>
                  {formatOrderDate(order.dateCreated || order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total:</span>
                <span className="font-medium">
                  ${(order.totalAmount || order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-lg font-medium mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span>{order.customerName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span>{order.customerEmail || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span>{order.customerPhone || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="px-6 py-4 border-t border-gray-200">
          <h2 className="text-lg font-medium mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName || "Unknown Product"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          ${(item.price || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.quantity || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          $
                          {((item.price || 0) * (item.quantity || 0)).toFixed(
                            2,
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No items found for this order
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Show order summary if items exist */}
          {items.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">
                    ${(order.totalAmount || order.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Invoice Button */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <Link
              to={`/generate-invoice/${id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              target="_blank"
            >
              Generate Invoice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
