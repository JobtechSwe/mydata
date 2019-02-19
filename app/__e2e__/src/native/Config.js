let Config

function setConfig (conf) {
  Config = Object.assign(Config, conf)
}

function clearConfig () {
  Config = Object.assign({}, { setConfig, clearConfig })
}

clearConfig()

module.exports = Config
