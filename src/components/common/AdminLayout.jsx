import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = ({ children }) => {
  const { darkMode } = useTheme();
  
  useEffect(() => {
    // Make truly full-screen
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  return (
    <div className={`fixed inset-0 w-screen h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {children}
    </div>
  );
};

export default AdminLayout;