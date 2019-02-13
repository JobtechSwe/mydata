module.exports = {
  name: 'app',
  displayName: 'Phone App',
  rootDir: './',
  setupFiles: ['<rootDir>/jest.setup.js'],
  clearMocks: true,
  preset: 'react-native',
  moduleFileExtensions: [
    'js'
  ],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.js$',
  testPathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/'
  ],
  cacheDirectory: '.jest/cache'
}
