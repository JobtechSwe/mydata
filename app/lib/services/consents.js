import Config from 'react-native-config'
import axios from 'axios'
import { getKey } from './jwks'
import { sign, verify } from './crypto'
import { getAccount } from './storage'
import { Base64 } from 'js-base64'

export async function get(consentRequestId) {
  const account = await getAccount()

  if (!account || !account.id) {
    throw new Error('Account is not set!')
  }

  const url = `${Config.OPERATOR_URL}/consents/requests/${encodeURIComponent(
    consentRequestId
  )}?accountId=${encodeURIComponent(account.id)}`

  let response
  try {
    response = await axios.get(url)
  } catch (error) {
    console.error('GET', url, error)
    throw error
  }
  const {
    data: { data, signature, clients },
  } = response

  let signingKey
  try {
    signingKey = await getKey(signature.kid)
  } catch (error) {
    console.error('GET', signature.kid, error)
    throw error
  }

  try {
    if (
      !(await verify(
        data,
        signature,
        signingKey.publicKey || signingKey.rsaPublicKey
      ))
    ) {
      throw new Error('Invalid signature')
    }

    return {
      consentRequestId,
      data,
      clients,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function approve({ data, consentRequestId }) {
  const url = `${Config.OPERATOR_URL}/consents`
  let payload
  try {
    const account = await getAccount()
    const encryptionKey = await getKey(data.kid)

    const consent = {
      accountId: account.id,
      accountKey: Base64.encode(account.keys.publicKey),
      clientId: data.clientId,
      consentRequestId,
      consentEncryptionKey: Base64.encode(
        encryptionKey.publicKey || encryptionKey.rsaPublicKey
      ),
      consentEncryptionKeyId: data.kid,
      scope: data.scope,
    }
    const signature = await sign(
      consent,
      'account_key',
      account.keys.privateKey
    )
    payload = { data: consent, signature }
    await axios.post(url, payload)
  } catch (error) {
    console.error('POST', url, payload, error)
    throw error
  }
}

export async function getAll () {
  const account = await getAccount()
  if (!account || !account.id) {
    throw Error('Account is not set')
  }

  const url = `${Config.OPERATOR_URL}/consents?accountId=${account.id}`

  try {
    const response = await axios.get(url)
    return response.data.data
  } catch (error) {
    console.error('GET', url, error)
    throw error
  }
}
