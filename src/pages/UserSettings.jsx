import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const { theme, toggleTheme } = useContext(ThemeContext);

// Add to return:
<button onClick={toggleTheme}>
  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
</button>