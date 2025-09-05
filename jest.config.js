module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleFileExtensions: ["js", "jsx", "json"],
  transform: { "^.+\\.(js|jsx)$": "babel-jest" }
};
