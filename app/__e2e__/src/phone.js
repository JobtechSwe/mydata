import { handle } from '../../lib/services/index'
import * as auth from '../../lib/services/auth'
import { parse } from '../../lib/utils/code'
import * as accountService from '../../lib/services/account'
import * as storageService from '../../lib/services/storage'
import Config from 'react-native-config'
import AsyncStorage from '@react-native-community/async-storage'

export async function createAccount({ firstName, lastName }) {
  const pds = { provider: 'memory', access_token: 'nope' }
  const acc = {
    firstName,
    lastName,
    pds,
  }
  const account = await accountService.save(acc)
  return account
}

export async function getAccount() {
  return storageService.getAccount()
}

export async function getAccountKeys() {
  return storageService.getAccountKeys()
}

export async function clearAccount() {
  return storageService.storeAccount()
}

export const clearStorage = async () => {
  return AsyncStorage.clear()
}

export const handleAuthCode = async ({ code }) => {
  const token = parse(code)
  return handle(token)
}

export const approveConnection = async (permissions, approved = []) => {
  const approvedMap = new Map(approved)
  return auth.approveConnection(permissions, approvedMap)
}

export const approveLogin = auth.approveLogin

export async function setConfig(config) {
  Object.entries(config).forEach(([key, val]) =>
    Object.assign(Config, { [key]: val })
  )
  return Config
}

export async function clearConfig() {
  Object.entries(Config).forEach(([key]) => delete Config[key])
  return Config
}

export async function getConfig() {
  return Config
}

export const getConnections = storageService.getConnections
