// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // ✅ tell ESLint to parse JSX
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      // ✅ browser + node (so `global` in tests isn’t flagged)
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  // Optional: test-only tweaks
  {
    files: ["**/*.{test,spec}.{js,jsx}", "src/test/**"],
    rules: {
      // loosen a bit in tests if you like
      "no-undef": "off"
    }
  }
];
