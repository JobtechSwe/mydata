module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  clearMocks: true,
  preset: "react-native",
  moduleFileExtensions: [
    "js"
  ],
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.js$",
  testPathIgnorePatterns: [
    "\\.snap$",
    "<rootDir>/node_modules/"
  ],
  cacheDirectory: ".jest/cache"
}