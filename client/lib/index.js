const { createMemoryStore } = require('./memoryStore')

module.exports = {
  create: require('./client'),
  utils: {
    createMemoryStore
  }
}
