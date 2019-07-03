module.exports = {
  name: 'client',
  displayName: '@egendata/client',
  rootDir: './',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testRegex: '\\.test\\.js$',
  testPathIgnorePatterns: ['<rootDir>/node_modules'],
  clearMocks: true
}
