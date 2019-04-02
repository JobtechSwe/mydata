module.exports = {
  name: 'cv',
  displayName: 'Examples: CV',
  setupFiles: ['<rootDir>/jest.setup.js', 'jest-canvas-mock'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  clearMocks: true
}
