const accounts = require('./accounts')
const data = require('./data')
const services = require('./services')

async function handle ({ header, payload, token }) {
  switch (payload.type) {
    case 'ACCOUNT_REGISTRATION':
      return accounts.registerAccount({ header, payload, token })
    case 'DATA_READ':
      return data.read({ header, payload, token })
    case 'DATA_WRITE':
      return data.write({ header, payload, token })
    case 'LOGIN':
      return services.accountLogin({ header, payload, token })
    case 'CONNECTION':
      return services.accountConnect({ header, payload, token })
    case 'SERVICE_REGISTRATION':
      return services.registerService({ header, payload, token })
    default:
      throw new Error('Unknown type')
  }
}

module.exports = { handle }
