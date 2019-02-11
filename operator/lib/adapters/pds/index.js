const { promisify } = require('util')
const { dirname } = require('path')
const providers = {
  dropbox: require('./dropbox')
}

function promiseFs (lib) {
  const fs = Object
    .keys(lib)
    .filter(prop => typeof lib[prop] === 'function')
    .reduce((newLib, funcName) => Object.assign(newLib, { [funcName]: promisify(lib[funcName].bind(lib)) }), {})

  fs.mkdirp = async (path, ...rest) => {
    try {
      await fs.stat(path, ...rest)
    } catch (err) {
      await fs.mkdirp(dirname(path), ...rest)
      await fs.mkdir(path, ...rest)
    }
  }

  fs.outputFile = async (path, ...rest) => {
    try {
      return await fs.writeFile(path, ...rest)
    } catch (err) {
      await fs.mkdirp(dirname(path))
      return fs.writeFile(path, ...rest)
    }
  }

  return fs
}

function get ({ pdsProvider, pdsCredentials }) {
  const fs = providers[pdsProvider].getFs(pdsCredentials)
  return promiseFs(fs)
}

module.exports = {
  get,
  providers: () => Object.values(providers).map(p => p.description)
}
