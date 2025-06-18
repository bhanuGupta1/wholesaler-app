// src/pages/UserSettings.jsx 
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const UserSettings = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Extended settings state
  const [settings, setSettings] = useState({
    // Display preferences
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    compactView: false,
    
    // Notification preferences
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    weeklyNewsletter: false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SettingCard = ({ title, description, children }) => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        {description && (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          checked 
            ? 'bg-indigo-600' 
            : darkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Customize your experience and manage your preferences
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Appearance Settings */}
          <SettingCard 
            title="🎨 Appearance" 
            description="Customize how the app looks and feels"
          >
            <div className="space-y-4">
              <ToggleSwitch
                checked={darkMode}
                onChange={toggleDarkMode}
                label="Dark Mode"
                description="Switch between light and dark themes"
              />
              
              <ToggleSwitch
                checked={settings.compactView}
                onChange={(value) => handleSettingChange('compactView', value)}
                label="Compact View"
                description="Show more content in less space"
              />

              <div>
                <label className="block font-medium mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </SettingCard>

          {/* Regional Settings */}
          <SettingCard 
            title="🌍 Regional Settings" 
            description="Set your location and format preferences"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="CST">Central Time</option>
                  <option value="MST">Mountain Time</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>
          </SettingCard>

          {/* Notification Settings */}
          <SettingCard 
            title="🔔 Notifications" 
            description="Choose what notifications you want to receive"
          >
            <div className="space-y-4">
              <ToggleSwitch
                checked={settings.emailNotifications}
                onChange={(value) => handleSettingChange('emailNotifications', value)}
                label="Email Notifications"
                description="Receive important updates via email"
              />
              
              <ToggleSwitch
                checked={settings.orderUpdates}
                onChange={(value) => handleSettingChange('orderUpdates', value)}
                label="Order Updates"
                description="Get notified about order status changes"
              />
              
              <ToggleSwitch
                checked={settings.promotionalEmails}
                onChange={(value) => handleSettingChange('promotionalEmails', value)}
                label="Promotional Emails"
                description="Receive special offers and deals"
              />
              
              <ToggleSwitch
                checked={settings.weeklyNewsletter}
                onChange={(value) => handleSettingChange('weeklyNewsletter', value)}
                label="Weekly Newsletter"
                description="Get weekly updates and featured products"
              />
            </div>
          </SettingCard>

          {/* More settings will be added in next commits */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <p className="text-center text-gray-500">Privacy and app preferences will be added in next commits...</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => setMessage({ type: 'success', text: 'Settings saved successfully!' })}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              darkMode
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;