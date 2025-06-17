import React from 'react';

const { theme, toggleTheme } = useContext(ThemeContext);

const [notifications, setNotifications] = useState(true);
const [language, setLanguage] = useState('en');


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
<select value={language} onChange={(e) => setLanguage(e.target.value)}>
  <option value="en">English</option>
  <option value="es">Spanish</option>
</select>
    </div>
  );
};

export default UserSettings;