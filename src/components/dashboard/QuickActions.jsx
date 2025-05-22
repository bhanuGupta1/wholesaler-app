// src/components/dashboard/QuickActions.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Interactive QuickActions Component
const QuickActions = ({ darkMode }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  
  const actions = [
    {
      id: 'new-order',
      to: '/create-order',
      name: 'New Order',
      description: 'Create customer order',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'add-product',
      to: '/inventory',
      name: 'Add Product',
      description: 'Add to inventory',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'green'
    },
    {
      id: 'low-stock',
      to: '/inventory',
      name: 'Low Stock',
      description: 'View alerts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'yellow'
    },
    {
      id: 'pending-orders',
      to: '/orders',
      name: 'Pending Orders',
      description: 'Process orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple'
    },
  ];
  
  return (
    <motion.div 
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h2>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link 
            key={action.id}
            to={action.to}
            className={`flex flex-col items-center p-4 rounded-xl 
              hover:bg-${action.color}-${darkMode ? '900/20' : '50'} 
              transition-all duration-300 transform ${hoverIndex === index ? 'scale-105' : 'scale-100'}
              group border ${darkMode ? 
                `border-gray-700 hover:border-${action.color}-800` : 
                `border-gray-100 hover:border-${action.color}-100`}`}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            aria-label={action.name}
          >
            <motion.div 
              className={`h-12 w-12 rounded-full ${darkMode ? 
                `bg-${action.color}-900/30` : 
                `bg-${action.color}-100`} 
                flex items-center justify-center mb-3 
                ${darkMode ? 
                  `group-hover:bg-${action.color}-900/50` : 
                  `group-hover:bg-${action.color}-200`} 
                transition-colors`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className={`${darkMode ? 
                `text-${action.color}-400` : 
                `text-${action.color}-600`}`}
              >
                {action.icon}
              </span>
            </motion.div>
            <span className={`text-sm font-medium ${darkMode ? 
              `text-gray-200 group-hover:text-${action.color}-400` : 
              `text-gray-800 group-hover:text-${action.color}-700`}`}
            >
              {action.name}
            </span>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {action.description}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;