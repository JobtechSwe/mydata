const config = require('./jest.config')

module.exports = Object.assign({}, config, {
  testRegex: '\\.integration\\.js$',
  reporters: ['jest-spec-reporter']
})
