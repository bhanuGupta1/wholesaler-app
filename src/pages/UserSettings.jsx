import React from 'react';

const { theme, toggleTheme } = useContext(ThemeContext);

const [notifications, setNotifications] = useState(true);


const UserSettings = () => {
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
    </div>
  );
};

export default UserSettings;