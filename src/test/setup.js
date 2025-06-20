import '@testing-library/jest-dom';

// Mock Firebase if needed
const mockFirebase = {
  initializeApp: () => {},
  getAuth: () => ({
    currentUser: null,
    onAuthStateChanged: () => {},
    signOut: () => Promise.resolve(),
  }),
  getFirestore: () => ({}),
};

// Mock Firebase functions globally if your app uses them
global.firebase = mockFirebase;

// Setup global test utilities
global.console = {
  ...console,
  // Uncomment to hide console.log during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};