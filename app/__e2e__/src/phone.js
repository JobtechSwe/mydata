import { handle } from '../../lib/services/index'
import * as auth from '../../lib/services/auth'
import { parse } from '../../lib/utils/code'
import * as account from '../../lib/services/account'
import * as storage from '../../lib/services/storage'
import * as crypto from '../../lib/services/crypto'
import * as consents from '../../lib/services/consents'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-community/async-storage'

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

export const clearStorage = async () => {
  return AsyncStorage.clear()
}

export const handleAuthCode = async ({ code }) => {
  const token = parse(code)
  return handle(token)
}

export const approveConnection = auth.approveConnection

export const approveLogin = auth.approveLogin

export const getAllConsents = consents.getAll

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

export const getConnections = storage.getConnections
