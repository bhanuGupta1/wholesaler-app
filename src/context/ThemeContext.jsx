// src/context/ThemeContext.jsx
import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Check local storage for user's theme preference or fallback to system preference
  const [darkMode, setDarkMode] = useState(() => {
    // First try to get from localStorage
    const savedTheme = localStorage.getItem("wholesaler-theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Otherwise check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return true;
    }
    // Default to light mode
    return false;
  });

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Update localStorage and document class when darkMode changes
  useEffect(() => {
    // Update localStorage
    localStorage.setItem("wholesaler-theme", darkMode ? "dark" : "light");

    // Update document class for global styling
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only apply if user hasn't manually set a preference
      if (!localStorage.getItem("wholesaler-theme")) {
        setDarkMode(e.matches);
      }
    };

    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
    }

    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;
