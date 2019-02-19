import * as account from '../../services/account'
import * as storage from '../../services/storage'
import * as crypto from '../../services/crypto'
import * as consents from '../../services/consents'
import Config from 'react-native-config'

export { Config }

export async function createAccount (firstName = 'Förnamn', lastName = 'Efternamnsson') {
  const keys = await crypto.generateKeys()
  const pds = { provider: 'memory', access_token: 'nope' }
  const acc = {
    firstName,
    lastName,
    keys,
    pds
  }
  await storage.storeAccount(acc)
  return account.save(acc)
}

export async function clearAccount () {
  return storage.storeAccount()
}

export async function getConsentRequest (code) {
  return consents.get(code)
}

export async function approveConsentRequest (request) {
  return consents.approve(request)
}
