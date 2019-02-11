const getval = require('get-value')

function find (path) {
  const objPath = path.split('/').filter(p => p).join('.')
  if (!objPath.length) return fs.filesystem
  const result = getval(fs.filesystem, objPath)
  return result
}

const stat = jest.fn((path, cb) => {
  const fd = find(path)
  if (!fd) {
    cb(new Error())
  } else {
    cb(null, {})
  }
})

const readFile = jest.fn((path, options, cb) => {
  if (!cb) cb = options
  const file = find(path)
  if (typeof file !== 'string') cb(new Error('File not found'))
  else cb(null, file)
})

const writeFile = jest.fn((path, data, options, cb) => {
  if (!cb) cb = options
  const tokens = path.split('/').filter(p => p)
  const fileName = tokens.pop()
  const dir = find(tokens.join('/'))
  if (!dir || typeof dir !== 'object') cb(new Error('dir not found'))
  dir[fileName] = data
  cb(null)
})

const mkdir = jest.fn((path, options, cb) => {
  if (!cb) cb = options
  const tokens = path.split('/').filter(p => p)
  const dir = tokens.pop()
  const parentDir = find(tokens.join('/'))
  if (!parentDir || typeof parentDir !== 'object') {
    cb(new Error('path not found or not a directory'))
  } else {
    parentDir[dir] = {}
    cb(null)
  }
})

const readdir = jest.fn((path, options, cb) => {
  if (!cb) cb = options
  const dir = find(path)
  if (!dir || typeof dir !== 'object') {
    cb(new Error('dir not found'))
  } else {
    cb(null, Object.keys(dir).filter(k => typeof dir[k] === 'string'))
  }
})

const fs = {
  filesystem: {},
  stat,
  readFile,
  writeFile,
  mkdir,
  readdir
}

module.exports = jest.fn().mockReturnValue(fs)
