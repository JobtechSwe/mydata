import * as account from '../../services/account'
import * as storage from '../../services/storage'
import * as crypto from '../../services/crypto'
import * as consents from '../../services/consents'
import Config from 'react-native-config'

export async function createAccount ({ firstName, lastName }) {
  const keys = await crypto.generateKeys()
  const pds = { provider: 'memory', access_token: 'nope' }
  const acc = {
    firstName,
    lastName,
    keys,
    pds
  }
  const accountWithId = await account.save(acc)
  await storage.storeAccount(accountWithId)
  return accountWithId
}

export async function clearAccount () {
  return storage.storeAccount()
}

export const getConsentRequest = consents.get

export const approveConsentRequest = consents.approve

export async function setConfig (config) {
  Object.entries(config).forEach(([key, val]) =>
    Object.assign(Config, { [key]: val }))
  return Config
}

export async function clearConfig () {
  Object.entries(Config).forEach(([key]) => delete Config[key])
  return Config
}

export async function getConfig () {
  return Config
}
