import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format } from 'date-fns';

/**
 * OrderDetails Component
 * 
 * This component displays detailed information about a specific order,
 * including customer info, items in the order, and total price. 
 */
const OrderDetails = () => {
  const { id } = useParams(); // Get order ID from route params
  const [order, setOrder] = useState(null); // State to store order details
  const [items, setItems] = useState([]);   // State to store order items
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    // Async function to fetch order details and associated items
    const fetchOrderDetails = async () => {
      try {
        console.log('Fetching order with ID:', id);
        
        // First, get the order document
        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          console.log('Order data:', orderData);
          
          // Set the order state with fetched data
          setOrder({
            id: orderSnap.id,
            ...orderData
          });

          // Now fetch items from the subcollection within this order document
          console.log('Fetching items from subcollection...');
          const itemsRef = collection(db, 'orders', id, 'orderItems');
          const itemsSnap = await getDocs(itemsRef);
          
          console.log('Items snapshot size:', itemsSnap.size);

          const orderItems = [];
          itemsSnap.forEach(doc => {
            console.log('Item doc:', doc.id, doc.data());
            orderItems.push({
              id: doc.id,
              ...doc.data()
            });
          });

          console.log('Fetched items:', orderItems);
          setItems(orderItems); // Update item list in state
        } else {
          console.error("Order not found");
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // When data is fetched show loading spinner.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

  // Calculate total from items if not available in order
  const calculatedTotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const displayTotal = order.totalAmount || order.total || calculatedTotal;

  // THis is my main UI for styling and designing.
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{order.orderId || `Order #${id.substring(0, 5)}`}</h1>
            <Link to="/orders" className="text-indigo-600 hover:text-indigo-900">
              ← Back to Orders
            </Link>
          </div>
        </div>

        {/* Here I put Order Info & Customer Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Info */}
          <div>
            <h2 className="text-lg font-medium mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>
                  {order.createdAt ? (
                    typeof order.createdAt.toDate === 'function' ? 
                      format(order.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') :
                      format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')
                  ) : (
                    order.dateCreated ? (
                      typeof order.dateCreated.toDate === 'function' ?
                        format(order.dateCreated.toDate(), 'dd MMM yyyy, hh:mm a') :
                        format(new Date(order.dateCreated), 'dd MMM yyyy, hh:mm a')
                    ) : '-'
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Items Count:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total:</span>
                <span className="font-medium">${displayTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-lg font-medium mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span>{order.customerEmail || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span>{order.customerPhone || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="px-6 py-4 border-t border-gray-200">
          <h2 className="text-lg font-medium mb-4">Order Items ({items.length})</h2>
          
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName || item.name || 'Unknown Product'}
                        </div>
                        {item.productId && (
                          <div className="text-sm text-gray-500">ID: {item.productId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">${(item.price || 0).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.quantity || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Order Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        ${displayTotal.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707-.293l-2.414-2.414a1 1 0 00-.707-.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items in this order</h3>
              <p className="mt-1 text-sm text-gray-500">
                This order doesn't contain any items, or they failed to load.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
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