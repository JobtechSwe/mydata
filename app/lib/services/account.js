import axios from 'axios'
import Config from 'react-native-config'
import { sign } from './crypto'
import { Base64 } from 'js-base64'
import AsyncStorage from '@react-native-community/async-storage'
import { createAccountToken } from './jwt'
import { v4 } from 'uuid'

async function pluckAndSign(account) {
  const data = pluck(account)
  const signature = await sign(data, 'account_key', account.keys.privateKey)

  return {
    data,
    signature,
  }
}

function pluck(account) {
  const data = {
    firstName: account.firstName,
    lastName: account.lastName,
    accountKey: Base64.encode(account.keys.publicKey),
    pds: {
      provider: account.pds.provider,
      access_token: account.pds.access_token,
    },
  }
  return data
}

export async function register(account) {
  try {
    // TODO: Use thumbprint of JWK as account id
    const id = v4()
    const jwt = await createAccountToken({ ...account, id })
    await axios.post(Config.OPERATOR_URL, jwt, { headers: { 'content-type': 'application/jwt' } })
    return id
  } catch (error) {
    console.error('could not post account to operator', error)
  }
}

export async function update(account) {
  const url = `${Config.OPERATOR_URL}/accounts/${account.id}`
  let payload
  try {
    payload = await pluckAndSign(account)
    await axios.put(url, payload)
  } catch (error) {
    console.error('PUT', url, payload, error.message)
    throw error
  }
}

export async function save(account) {
  try {
    if (account.id) {
      await update(account)
    } else {
      account.id = await register(account)
    }

    return account
  } catch (err) {
    throw err
  }
}

export const getAccount = async () => {
  try {
    const result = await AsyncStorage.getItem('account')
    return result ? JSON.parse(result) : undefined
  } catch (error) {
    console.error('Error while getting account-id from AsyncStorage:', error)
    return undefined
  }
}
