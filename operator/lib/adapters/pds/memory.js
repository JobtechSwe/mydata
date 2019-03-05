const MemoryFileSystem = require('memory-fs')
const fs = new MemoryFileSystem()

const description = {
  name: 'In memory provider'
}

module.exports = {
  getFs: () => fs,
  description
}
