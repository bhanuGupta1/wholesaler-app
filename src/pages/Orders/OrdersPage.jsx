import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import OrderTable from './OrderTable';
import OrderFilters from './OrderFilters';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    customer: ''
  });
  const [lastVisible, setLastVisible] = useState(null);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Create reference to orders collection
        const ordersRef = collection(db, 'orders');
        
        // Build filter constraints
        let constraints = [];
        
        // Add status filter if not 'all'
        if (filters.status !== 'all') {
          constraints.push(where('status', '==', filters.status));
        }
        
        // Add date filter if not 'all'
        if (filters.date !== 'all') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let dateConstraint;
          switch (filters.date) {
            case 'today':
              dateConstraint = where('dateCreated', '>=', Timestamp.fromDate(today));
              break;
            case 'yesterday':
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              dateConstraint = where('dateCreated', '>=', Timestamp.fromDate(yesterday));
              break;
            case 'week':
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              dateConstraint = where('dateCreated', '>=', Timestamp.fromDate(weekAgo));
              break;
            case 'month':
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              dateConstraint = where('dateCreated', '>=', Timestamp.fromDate(monthAgo));
              break;
            default:
              break;
          }
          
          if (dateConstraint) {
            constraints.push(dateConstraint);
          }
        }
        
        // Always sort by date
        constraints.push(orderBy('dateCreated', 'desc'));
        
        // Build query with pagination
        let ordersQuery;
        if (page === 1 || !lastVisible) {
          ordersQuery = query(ordersRef, ...constraints, limit(ordersPerPage));
        } else {
          ordersQuery = query(ordersRef, ...constraints, startAfter(lastVisible), limit(ordersPerPage));
        }
        
        // Execute query
        const snapshot = await getDocs(ordersQuery);
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc);
        
        // Process fetched orders
        const fetchedOrders = [];
        
        for (const doc of snapshot.docs) {
          const orderData = doc.data();
          
          // Apply customer filter client-side (Firestore doesn't support LIKE queries)
          if (filters.customer && !orderData.customerName.toLowerCase().includes(filters.customer.toLowerCase())) {
            continue;
          }
          
          // Get item count (could be stored in the order document or calculated)
          let itemCount = orderData.itemCount || 0;
          let totalAmount = orderData.totalAmount || 0;
          
          // If not already in order document, you could fetch and calculate
          if (!orderData.itemCount || !orderData.totalAmount) {
            const itemsQuery = query(
              collection(db, 'orderItems'),
              where('orderId', '==', doc.id)
            );
            const itemsSnapshot = await getDocs(itemsQuery);
            
            itemCount = itemsSnapshot.size;
            
            if (!orderData.totalAmount) {
              totalAmount = 0;
              itemsSnapshot.forEach(itemDoc => {
                const itemData = itemDoc.data();
                totalAmount += (itemData.price * itemData.quantity);
              });
            }
          }
          
          fetchedOrders.push({
            id: doc.id,
            orderId: orderData.orderId || `#ORD-${doc.id.substring(0, 5)}`,
            customerName: orderData.customerName,
            dateCreated: orderData.dateCreated,
            status: orderData.status,
            itemCount,
            totalAmount
          });
        }
        
        setOrders(fetchedOrders);
        
        // Get total count for pagination
        const countQuery = query(ordersRef, ...constraints.filter(c => c.type !== 'limit' && c.type !== 'startAfter'));
        const countSnapshot = await getDocs(countQuery);
        setTotalOrders(countSnapshot.size);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [filters, page, lastVisible]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
    setLastVisible(null);
  };
  
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      setLastVisible(null); // Reset pagination when going back
    }
  };

  const handleNextPage = () => {
    if (page * ordersPerPage < totalOrders) {
      setPage(page + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      
      <OrderFilters filters={filters} onFilterChange={handleFilterChange} />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div>
          <OrderTable orders={orders} />
          
          {/* Pagination controls */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{orders.length > 0 ? (page - 1) * ordersPerPage + 1 : 0}</span> to{' '}
                  <span className="font-medium">{Math.min(page * ordersPerPage, totalOrders)}</span> of{' '}
                  <span className="font-medium">{totalOrders}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  {/* Current page indicator */}
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {page}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={page * ordersPerPage >= totalOrders}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page * ordersPerPage >= totalOrders ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;