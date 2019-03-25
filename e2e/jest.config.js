module.exports = {
  name: 'e2e',
  displayName: 'e2e',
  rootDir: './jest',
  testEnvironment: 'node',
  testRegex: '\\.test\\.js$',
  testPathIgnorePatterns: ['<rootDir>/node_modules'],
  resetModules: true,
  clearMocks: true
}
