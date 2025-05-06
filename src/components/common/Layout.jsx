// src/components/common/Layout.jsx
import { useState } from 'react';
import Navbar from './Navbar';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Mobile sidebar button */}
      <button
        className="fixed bottom-4 right-4 p-3 rounded-full bg-primary text-white shadow-lg z-30 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      
      {/* Sidebar for mobile */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800">Wholesaler</h2>
            <button
              className="text-gray-600 focus:outline-none"
              onClick={() => setSidebarOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {user && (
            <nav className="space-y-1">
              <Link
                to="/"
                className={`block px-4 py-2 rounded-lg ${isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/inventory"
                className={`block px-4 py-2 rounded-lg ${isActive('/inventory') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setSidebarOpen(false)}
              >
                Inventory
              </Link>
              <Link
                to="/orders"
                className={`block px-4 py-2 rounded-lg ${isActive('/orders') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setSidebarOpen(false)}
              >
                Orders
              </Link>
              <Link
               to="/create-order"
               className={`block px-4 py-2 rounded-lg ${isActive('/create-order') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
               onClick={() => setSidebarOpen(false)}
             >
               New Order
             </Link>
           </nav>
         )}
       </div>
     </div>
     
     <main className="flex-grow p-4 sm:p-6 lg:p-8">
       {children}
     </main>
     
     <footer className="bg-white border-t py-6 mt-auto">
       <div className="container mx-auto px-4 text-center">
         <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Wholesaler App. All rights reserved.</p>
       </div>
     </footer>
   </div>
 );
};

export default Layout;