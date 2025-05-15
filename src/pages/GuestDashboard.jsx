// src/pages/GuestDashboard.jsx
import { useTheme } from '../context/ThemeContext';

const GuestDashboard = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-3xl font-bold mb-8">Welcome to Wholesaler</h1>
      {/* Content will go here */}
    </div>
  );
};

export default GuestDashboard;
