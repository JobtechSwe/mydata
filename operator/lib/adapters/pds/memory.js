const MemoryFileSystem = require('memory-fs')
const fs = new MemoryFileSystem()

const description = {
  name: 'Memory'
}

module.exports = {
  getFs: () => fs,
  description
}
