import Config from 'react-native-config'
import axios from 'axios'
import { getKey } from './jwks'
import { sign, verify } from './crypto'
import { getAccount } from './storage'
import { Base64 } from 'js-base64'

export function parse (dataString) {
  const loginRequest = JSON.parse(dataString)

  try {
    let validFormat = (loginRequest.type === 'LOGIN_REQUESTED' &&
      typeof loginRequest.clientId === 'string' &&
      typeof loginRequest.sessionId === 'string')

    if (!validFormat) {
      throw new Error('Incorrect login request JSON format')
    }
  } catch (error) {
    console.error(error)
    throw error
  }

  return loginRequest
}

export async function approve (loginRequest) {
  const operatorUrl = encodeURI(Config.OPERATOR_URL)
  const account = await getAccount()
  const accountId = encodeURIComponent(account.id)
  const url = `${operatorUrl}/accounts/${accountId}/login`
  // todo: put actual data in POST

  let loginApproval = {
    timeStamp: Date.now(),
    clientId: loginRequest.clientId,
    sessionId: loginRequest.sessionId
  }

  axios.post(url, loginApproval)
  /*
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
      scope: data.scope
    }
    const signature = await sign(consent, 'account_key', account.keys.privateKey)
    payload = { data: consent, signature }
    await axios.post(url, payload)
  } catch (error) {
    console.error('POST', url, payload, error)
    throw error
  }
  */
}
