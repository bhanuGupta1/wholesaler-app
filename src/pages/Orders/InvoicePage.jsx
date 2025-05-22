import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format } from 'date-fns';

/**
 * InvoicePage Component
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
  const invoiceRef = useRef(null);
  
  // Fetch order and its items when component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          setOrder({
            id: orderSnap.id,
            ...orderSnap.data()
          });
          
          // Fetch order items
          const itemsRef = collection(db, 'orderItems');
          const q = query(itemsRef, where('orderId', '==', id));
          const itemsSnap = await getDocs(q);
          
          const orderItems = [];
          itemsSnap.forEach(doc => {
            orderItems.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setItems(orderItems);
        } else {
          console.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
        <Link to={`/orders/${id}`} className="text-indigo-600 hover:text-indigo-900">
          ← Back to Order
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Print Invoice
        </button>
      </div>
      
      <div ref={invoiceRef} className="bg-white shadow rounded-lg overflow-hidden p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-gray-500 mt-1">{order.orderId || `#ORD-${id.substring(0, 5)}`}</p>
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
            <p className="font-medium">{order.customerName}</p>
            <p>{order.customerEmail || ''}</p>
            <p>{order.customerPhone || ''}</p>
            <p>{order.billingAddress?.street || ''}</p>
            <p>{order.billingAddress?.city || ''}, {order.billingAddress?.state || ''} {order.billingAddress?.zip || ''}</p>
          </div>
          <div>
            <h3 className="text-gray-500 font-medium mb-2">Invoice Details:</h3>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Invoice Date:</span>
              <span>{format(new Date(), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Order Date:</span>
              <span>{order.dateCreated ? format(new Date(order.dateCreated.toDate()), 'dd MMM yyyy') : '-'}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Status:</span>
              <span>{order.status}</span>
            </div>
          </div>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200 mb-8">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-500">
                  ${item.price?.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
          {/* Here is the summary of the order. */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t">
              <span className="font-medium">Subtotal:</span>
              <span>
                ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Tax:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg border-t">
              <span>Total:</span>
              <span>
                ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>Payment is due within 30 days.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;