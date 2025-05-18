import React, { useState, useEffect } from 'react';
// Importing Firestore functions to interact with the database
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
// Importing Firestore database instance
import { db } from '../../firebase/config';
// Importing child components to display orders and filters
import OrderTable from './OrderTable';
import OrderFilters from './OrderFilters';

const OrdersPage = () => {
  // Here I add state to hold the list of orders
  const [orders, setOrders] = useState([]);
  // Here I add state to track whether data is currently loading
  const [loading, setLoading] = useState(true);
  // Here I add state for filters used to filter the orders list
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    customer: ''
  });

  // Here I use useEffect to fetch orders from Firestore when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        // Here I reference the 'orders' collection from Firestore
        const ordersRef = collection(db, 'orders');
        // Here I create a query to order the orders by dateCreated in descending order and limit to 10 results
        const q = query(ordersRef, orderBy('dateCreated', 'desc'), limit(10));
        // Here I execute the query
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders = [];
        // Here I loop through each document in the snapshot and push to the fetchedOrders array
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({
            id: doc.id, // Include document ID
            ...doc.data() // Spread the document data
          });
        });

        // Here I update the orders state with the fetched data
        setOrders(fetchedOrders);
      } catch (error) {
        // If there's an error, log it to the console
        console.error("Error fetching orders:", error);
      } finally {
        // Set loading to false after fetching is done or failed
        setLoading(false);
      }
    };

    // Call the function to fetch orders
    fetchOrders();
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Here I update the filter state when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Here I render the component UI
  return (
    // Container with Tailwind CSS utility classes for layout and spacing
    <div className="container mx-auto px-4 py-8">
      {/* Page heading */}
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      
      {/* Filter component to filter the list of orders */}
      <OrderFilters filters={filters} onFilterChange={handleFilterChange} />
      
      {/* Conditional rendering: Show loading spinner while data is loading */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          {/* Spinner animation using Tailwind CSS */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        // Show the order table once loading is complete
        <OrderTable orders={orders} />
      )}
    </div>
  );
};

// Exporting the OrdersPage component so it can be used elsewhere
export default OrdersPage;
