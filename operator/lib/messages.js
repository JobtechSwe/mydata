const accounts = require('./accounts')
const data = require('./data')
const services = require('./services')

async function handle ({ header, payload, token }, res) {
  switch (payload.type) {
    case 'ACCOUNT_REGISTRATION':
      return accounts.registerAccount({ header, payload, token }, res)
    case 'DATA_READ':
      return data.read({ header, payload, token }, res)
    case 'DATA_WRITE':
      return data.write({ header, payload, token }, res)
    case 'LOGIN':
      return services.accountLogin({ header, payload, token }, res)
    case 'CONNECT':
      return services.accountConnect({ header, payload, token }, res)
    case 'SERVICE_REGISTRATION':
      return services.registerService({ header, payload, token }, res)
    default:
      throw new Error('Unknown type')
  }
}

module.exports = { handle }
