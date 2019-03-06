import axios from 'axios'
import Config from 'react-native-config'
import { sign } from './crypto'
import { Base64 } from 'js-base64'

async function pluckAndSign (account) {
  const data = pluck(account)
  const signature = await sign(data, 'account_key', account.keys.privateKey)

  return {
    data,
    signature,
  }
}

function pluck (account) {
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

export async function register (account) {
  const url = `${Config.OPERATOR_URL}/accounts`
  const payload = await pluckAndSign(account)
  try {
    const { data: { data: { id } } } = await axios.post(url, payload)
    return id
  } catch (error) {
    console.error('POST', url, payload, error.message)
    throw error
  }
}

export async function update (account) {
  const url = `${Config.OPERATOR_URL}/accounts/${account.id}`
  const payload = await pluckAndSign(account)
  try {
    await axios.put(url, payload)
  } catch (error) {
    console.error('PUT', url, payload, error.message)
    throw error
  }
}

export async function save (account) {
  if (account.id) {
    await update(account)
  } else {
    account.id = await register(account)
  }
  return account
}
