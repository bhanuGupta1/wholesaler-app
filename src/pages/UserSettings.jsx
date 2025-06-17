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
    <div className="max-w-3xl mx-auto p-4 sm:p-6"> {/* Updated container padding */}
      <h1 className="text-3xl font-bold text-indigo-600">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Added responsive grid */}
        <button onClick={toggleTheme} className="px-4 py-2 rounded bg-indigo-600 text-white">
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>

        <label className="flex items-center">
          <input 
            type="checkbox" 
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
            className="mr-2"
          />
          Enable notifications
        </label>

        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} 
          className="p-2 border rounded"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="mt-4">
          <button 
            type="submit" 
            disabled={isLoading || !hasChanges} 
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {isLoading ? 'Saving...' : hasChanges ? 'Save Settings' : 'No Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
