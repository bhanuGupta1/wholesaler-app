// src/components/common/ThemeToggle.jsx - Enhanced theme-aware version
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`relative inline-flex items-center rounded-full transition-all duration-300 focus:outline-none ${className} ${
        darkMode
          ? "bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/25"
          : "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25"
      }`}
      style={{ width: "56px", height: "28px" }}
      aria-pressed={darkMode}
      aria-label={
        darkMode ? "Switch to neumorphism theme" : "Switch to cyberpunk theme"
      }
      title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
    >
      {/* Background glow effect */}
      <div
        className={`absolute inset-0 rounded-full opacity-75 ${
          darkMode
            ? "bg-gradient-to-r from-cyan-400 to-purple-400"
            : "bg-gradient-to-r from-blue-400 to-purple-400"
        } animate-pulse`}
      ></div>

      {/* Toggle handle */}
      <span
        className={`relative inline-block h-6 w-6 transform rounded-full transition-all duration-300 shadow-lg ${
          darkMode
            ? "translate-x-7 bg-black border-2 border-cyan-400"
            : "translate-x-0.5 bg-white border-2 border-blue-400"
        }`}
        style={{
          boxShadow: darkMode
            ? "0 0 15px rgba(0, 255, 255, 0.5)"
            : "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Icon container */}
        <div className="flex items-center justify-center h-full w-full">
          {darkMode ? (
            // Cyberpunk Moon icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-cyan-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            // Neumorphism Sun icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-orange-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </span>

      {/* Screen reader text */}
      <span className="sr-only">
        {darkMode
          ? "Switch to Light Neumorphism Theme"
          : "Switch to Dark Cyberpunk Theme"}
      </span>

      {/* Theme indicator text (optional, shows on hover) */}
      <div
        className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
          darkMode ? "text-cyan-400" : "text-blue-600"
        }`}
      >
        {darkMode ? "Cyberpunk" : "Neumorphism"}
      </div>
    </button>
  );
};

export default ThemeToggle;
