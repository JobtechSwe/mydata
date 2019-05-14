const accounts = require('./accounts')
const data = require('./data')
const services = require('./services')

const handlers = {
  ACCOUNT_REGISTRATION: accounts.registerAccount,
  DATA_READ: data.read,
  DATA_WRITE: data.write,
  LOGIN: services.accountLogin,
  CONNECTION: services.accountConnect,
  SERVICE_REGISTRATION: services.registerService
}

async function handle (req, res) {
  if (!handlers[req.payload.type]) {
    throw new Error('Unknown type')
  }
  return handlers[req.payload.type](req, res)
}

module.exports = { handle }
