module.exports = {
  name: 'operator',
  displayName: 'Operator',
  rootDir: './',
  testEnvironment: 'node',
  testRegex: '\\.test\\.js$',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules'],
  clearMocks: true
}
