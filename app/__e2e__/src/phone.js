import * as account from '../../lib/services/account'
import * as storage from '../../lib/services/storage'
import * as crypto from '../../lib/services/crypto'
import * as consents from '../../lib/services/consents'
import * as qrcode from '../../lib/utils/qrcode'
import Config from 'react-native-config'

export async function createAccount ({ firstName, lastName }) {
  const keys = await crypto.generateKeys()
  const pds = { provider: 'memory', access_token: 'nope' }
  const acc = {
    firstName,
    lastName,
    keys,
    pds,
  }
  const accountWithId = await account.save(acc)
  await storage.storeAccount(accountWithId)
  return accountWithId
}

export async function clearAccount () {
  return storage.storeAccount()
}

export const getConsentRequest = (url) => {
  const { type, code } = qrcode.parse(url)
  if (type !== 'register') {
    throw new Error('Not a register code')
  }
  return consents.get(code)
}

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
