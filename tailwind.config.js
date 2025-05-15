/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',   // ✅ Add this line
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#4F46E5",
          secondary: "#10B981",
          accent: "#F59E0B",
        }
      },
    },
    plugins: [],
}
