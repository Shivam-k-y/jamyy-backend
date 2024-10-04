export default {
    testEnvironment: 'jsdom',
    moduleDirectories: ['node_modules', 'src'],
    testMatch: ['<rootDir>/src/__tests__/**/*.{js,jsx,ts,tsx}'],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.js'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
    },
  };