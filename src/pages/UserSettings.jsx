import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext'; // Assuming ThemeContext is properly imported

const UserSettings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulating a delay to represent async operation
    await new Promise(r => setTimeout(r, 1000));

    setIsLoading(false);
    alert('Settings saved!');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-600">Settings</h1>

      <button onClick={toggleTheme}>
        Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
      </button>

      <label>
        <input 
          type="checkbox" 
          checked={notifications}
          onChange={() => setNotifications(!notifications)}
        />
        Enable notifications
      </label>

      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded">
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default UserSettings;
