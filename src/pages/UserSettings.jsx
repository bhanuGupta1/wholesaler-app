import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext'; // Here I add: Importing theme context for theme switching.

const UserSettings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext); // Here I add: Accessing theme state and toggle function.
  const [notifications, setNotifications] = useState(true); // Here I add: Managing notification state.

  // Here I add: Function to handle form submission.
  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings updated successfully!'); // Here I add: Simple alert for save confirmation.
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
        Settings {/* Here I add: Title for settings page */}
      </h1>

      <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        
        {/* Appearance Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Appearance {/* Here I add: Section heading for theme settings */}
          </h2>
          <button
            type="button"
            onClick={toggleTheme}
            className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-500"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode {/* Here I add: Toggles between dark and light mode */}
          </button>
        </div>

        {/* Notifications Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Notifications {/* Here I add: Section heading for notification settings */}
          </h2>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="form-checkbox h-5 w-5 text-indigo-600 dark:text-indigo-400"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Enable email notifications {/* Here I add: Toggle for enabling/disabling notifications */}
            </span>
          </label>
        </div>

        {/* Language Selection Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Language {/* Here I add: Section heading for language selection */}
          </h2>
          <select className="mt-2 w-full border px-4 py-2 rounded dark:bg-gray-700 dark:text-white">
            <option>English (Default)</option>
            <option>Spanish</option>
            <option>Hindi</option>
            <option>Chinese</option>
            <option>German</option> {/* Here I add: Expanded language support */}
            <option>French</option>
          </select>
        </div>

        {/* Save Button */}
        <div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
            Save Settings {/* Here I add: Saves settings when clicked */}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
