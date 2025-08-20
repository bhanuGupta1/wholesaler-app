import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderWithItems } from "../../firebase/orderService"; // Import the service function
import { format } from "date-fns";

/**
 * InvoicePage Component - FIXED VERSION
 *
 * Displays a printable invoice for a specific order.
 *
 * Features:
 * - Shows invoice header with company and order information
 * - Shows customer billing information
 * - Shows all items with prices, quantities, and totals
 * - Provides a print button
 * - Loading state handling
 */
const InvoicePage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const invoiceRef = useRef(null);

  // FIXED: Fetch order and its items using the service function
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching order for invoice:", id);

        // Use the getOrderWithItems function from orderService
        const orderWithItems = await getOrderWithItems(id);

        console.log("Invoice - Fetched order:", orderWithItems);

        // Set the order and items from the service response
        setOrder(orderWithItems);
        setItems(orderWithItems.items || []);
      } catch (error) {
        console.error("Error fetching order details for invoice:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Print invoice content
  const handlePrint = () => {
    const printContents = invoiceRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // Helper function to format date - handles both Firestore timestamp and regular date
  const formatInvoiceDate = (dateField) => {
    if (!dateField) return "-";

    try {
      // Handle Firestore timestamp
      if (dateField.toDate && typeof dateField.toDate === "function") {
        return format(dateField.toDate(), "dd MMM yyyy");
      }
      // Handle regular Date object
      if (dateField instanceof Date) {
        return format(dateField, "dd MMM yyyy");
      }
      // Handle string dates
      if (typeof dateField === "string") {
        return format(new Date(dateField), "dd MMM yyyy");
      }
      return "-";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  // Calculate totals from items
  const calculateSubtotal = () => {
    // Use stored subtotal if available, otherwise calculate from items
    if (order.subtotal !== undefined && order.subtotal !== null) {
      return order.subtotal;
    }

    // Fallback: Calculate from items
    return items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );
  };

  const calculateTax = () => {
    // Use stored tax amount if available, otherwise calculate 10% tax on subtotal
    if (order.taxAmount !== undefined && order.taxAmount !== null) {
      return order.taxAmount;
    }

    // Fallback: Apply 10% tax on subtotal
    const subtotal = calculateSubtotal();
    return subtotal * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    // Use stored total if available, otherwise calculate subtotal + tax
    if (order.totalAmount || order.total) {
      return order.totalAmount || order.total;
    }

    // Fallback: Calculate subtotal + tax
    return calculateSubtotal() + calculateTax();
  };

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
            Error Loading Invoice
          </h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/orders" className="text-indigo-600 hover:text-indigo-900">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Handle case where order is not found
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link
          to={`/orders/${id}`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          ← Back to Order
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Print Invoice
        </button>
      </div>

      <div
        ref={invoiceRef}
        className="bg-white shadow rounded-lg overflow-hidden p-8"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-gray-500 mt-1">
              {order.orderId || `#ORD-${id.substring(0, 5)}`}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">Wholesaler App</h2>
            <p className="text-gray-500">123 Business Street</p>
            <p className="text-gray-500">Auckland, New Zealand</p>
            <p className="text-gray-500">contact@wholesaler.com</p>
          </div>
        </div>

        {/* Billing and Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
            <p className="font-medium">{order.customerName || "N/A"}</p>
            <p>{order.customerEmail || ""}</p>
            <p>{order.customerPhone || ""}</p>
            <p>{order.billingAddress?.street || ""}</p>
            <p>
              {order.billingAddress?.city
                ? `${order.billingAddress.city}, ${order.billingAddress?.state || ""} ${order.billingAddress?.zip || ""}`
                : ""}
            </p>
          </div>
          <div>
            <h3 className="text-gray-500 font-medium mb-2">Invoice Details:</h3>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Invoice Date:</span>
              <span>{format(new Date(), "dd MMM yyyy")}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Order Date:</span>
              <span>
                {formatInvoiceDate(order.dateCreated || order.createdAt)}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Status:</span>
              <span className="capitalize">{order.status || "pending"}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="min-w-full divide-y divide-gray-200 mb-8">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.productName || "Unknown Product"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-500">
                    ${(item.price || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-500">
                    {item.quantity || 0}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-900">
                    ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-4 text-center text-sm text-gray-500"
                >
                  No items found for this order
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Order Summary */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t">
              <span className="font-medium">Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Tax:</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg border-t">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Show order total verification if available */}
        {order.totalAmount || order.total ? (
          <div className="mt-4 text-right text-sm text-gray-500">
            <p>Order Total: ${(order.totalAmount || order.total).toFixed(2)}</p>
          </div>
        ) : null}

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>Payment is due within 30 days.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
