const {
  account,
  consents,
  crypto,
  storage,
  Config: { setConfig, clearConfig }
} = require('./services')

async function createAccount (firstName = 'Förnamn', lastName = 'Efternamnsson') {
  const keys = await crypto.generateKeys()
  const pds = { provider: 'dropbox', access_token: null }
  const acc = {
    firstName,
    lastName,
    keys,
    pds
  }
  await storage.storeAccount(acc)
  return account.save(acc)
}

async function clearAccount () {
  return storage.storeAccount()
}

async function getConsentRequest (code) {
  return consents.getConsentRequest(code)
}

async function approveConsentRequest (request) {
  return consents.approve(request)
}

module.exports = {
  setConfig,
  clearConfig,

  createAccount,
  clearAccount,

  getConsentRequest,
  approveConsentRequest
}

setConfig({ OPERATOR_URL: 'http://localhost:3000/api' })
createAccount()
console.log('YEAH')
