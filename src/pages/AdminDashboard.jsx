import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h2 className="text-xl font-semibold mb-4">Welcome, Admin!</h2>
        <p className="mb-4">This is the admin dashboard where you can manage users and system settings.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <h3 className="font-semibold">User Management</h3>
            <p className="text-sm mt-2">Manage user accounts and permissions</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <h3 className="font-semibold">System Settings</h3>
            <p className="text-sm mt-2">Configure system-wide settings</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <h3 className="font-semibold">Reports</h3>
            <p className="text-sm mt-2">View system reports and analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;