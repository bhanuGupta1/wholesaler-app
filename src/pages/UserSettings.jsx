import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext'; // Import toast context

const UserSettings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { showToast } = useToast(); // Use toast functionality

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  
  // Track original settings & detect changes
  const [originalSettings] = useState({ notifications, language });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(
      notifications !== originalSettings.notifications || language !== originalSettings.language
    );
  }, [notifications, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
      showToast('No changes detected!', 'warning');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);

    showToast('Settings saved successfully!', 'success'); // Show success toast notification
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 dark:bg-gray-900 dark:text-gray-200"> {/* Dark mode support */}
      <h1 className="text-indigo-600 dark:text-indigo-400">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Responsive grid */}
        <button 
          onClick={toggleTheme} 
          className="px-4 py-2 rounded bg-indigo-600 text-white dark:bg-indigo-500 dark:text-gray-100"
        >
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>

        <label className="flex items-center">
          <input 
            type="checkbox" 
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
            className="mr-2"
          />
          <span className="text-gray-900 dark:text-gray-300">Enable notifications</span>
        </label>

        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} 
          className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="hi">Hindi</option>
          <option value="de">German</option>
          <option value="fr">French</option>
          <option value="zh">Chinese</option>
        </select>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="mt-4">
          <button 
            type="submit" 
            disabled={isLoading || !hasChanges} 
            className="px-4 py-2 bg-indigo-600 text-white rounded dark:bg-indigo-500 dark:text-gray-100"
          >
            {isLoading ? 'Saving...' : hasChanges ? 'Save Settings' : 'No Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
