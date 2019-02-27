import Config from 'react-native-config'
import axios from 'axios'
import { getKey } from './jwks'
import { sign, verify } from './crypto'
import { getAccount } from './storage'
import { Base64 } from 'js-base64'

export async function get (id) {
  const account = await getAccount()
  const url = `${Config.OPERATOR_URL}/consents/requests/${encodeURIComponent(id)}?accountId=${account.id}`

  let response
  try {
    response = await axios.get(url)
  } catch (error) {
    console.error('GET', url, error)
    throw error
  }
  const { data: { data, signature, client } } = response

  let signingKey
  const jwksUri = `${data.clientId}${client.jwksUrl}`
  try {
    signingKey = await getKey(signature.kid)
  } catch (error) {
    console.error('GET', jwksUri, error)
    throw error
  }

  try {
    if (!await verify(data, signature, signingKey.publicKey || signingKey.rsaPublicKey)) {
      throw new Error('Invalid signature')
    }

    return {
      data: {
        ...data,
        consentRequestId: id,
      },
      client,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function approve ({ data }) {
  const url = `${Config.OPERATOR_URL}/consents`
  let payload
  try {
    const account = await getAccount()
    const encryptionKey = await getKey(data.kid)

    const consent = {
      accountId: account.id,
      accountKey: Base64.encode(account.keys.publicKey),
      clientId: data.clientId,
      consentRequestId: data.consentRequestId,
      consentEncryptionKey: Base64.encode(encryptionKey.publicKey || encryptionKey.rsaPublicKey),
      consentEncryptionKeyId: data.kid,
      scope: data.scope,
    }
    const signature = await sign(consent, 'account_key', account.keys.privateKey)
    payload = { data: consent, signature }
    await axios.post(url, payload)
  } catch (error) {
    console.error('POST', url, payload, error)
    throw error
  }
}
