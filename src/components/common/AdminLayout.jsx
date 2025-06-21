// src/components/common/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = ({ children }) => {
  const { darkMode } = useTheme();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    
    document.body.style.overflow = 'hidden';
    return () => {
      clearInterval(interval);
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  return (
    <div className={`fixed inset-0 w-screen h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`absolute top-0 left-0 right-0 h-6 flex justify-between items-center px-4 text-xs ${
        darkMode ? 'bg-gray-800 text-cyan-400' : 'bg-gray-100 text-gray-600'
      }`}>
        <span>Admin Panel</span>
        <span>{time}</span>
      </div>
      <div className="pt-6 h-full">{children}</div>
    </div>
  );
};

export default AdminLayout;