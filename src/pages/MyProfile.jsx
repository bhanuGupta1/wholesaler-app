// src/pages/MyProfile.jsx - Commit 1: Basic structure and header
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const MyProfile = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'account', name: 'Account Info', icon: 'ℹ️' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 mb-6`}>
          <div className="flex items-center space-x-4">
            <div className={`h-20 w-20 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center overflow-hidden`}>
              <span className="text-2xl font-bold">
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.displayName || 'User Profile'}</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                user?.accountType === 'admin' ? 'bg-red-100 text-red-800' :
                user?.accountType === 'manager' ? 'bg-purple-100 text-purple-800' :
                user?.accountType === 'business' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.accountType?.toUpperCase() || 'USER'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `border-indigo-500 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <p className="text-center text-gray-500">Tab content will be added in next commits...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;