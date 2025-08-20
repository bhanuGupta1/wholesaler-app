/* .eslintrc.cjs */
module.exports = {
  root: true,
  env: {
    browser: true,      // fixes 'Intl is not defined', window, document, etc.
    es2021: true,
    node: false
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true }
  },
  plugins: ["react", "react-hooks", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  settings: {
    react: { version: "detect" }
  },
  rules: {
    "no-case-declarations": "warn",
    "no-prototype-builtins": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
  },
  overrides: [
    {
      files: ["**/*.test.jsx", "**/*.test.js", "src/test/**"],
      env: { jest: true, node: true }
    }
  ]
};
