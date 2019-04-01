module.exports = {
  name: 'app',
  displayName: 'Phone App',
  rootDir: './',
  setupFiles: ['<rootDir>/jest.setup.js'],
  clearMocks: true,
  preset: 'react-native',
  moduleFileExtensions: ['js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['\\.snap$', '<rootDir>/node_modules/'],
  cacheDirectory: '.jest/cache',
}
