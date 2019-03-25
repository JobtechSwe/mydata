import Config from 'react-native-config'
import axios from 'axios'
import { getAccount } from './storage'
import { Base64 } from 'js-base64'

export function parse (code) {
  const loginRequest = JSON.parse(Base64.decode(code))

  try {
    let validFormat = (
      typeof loginRequest.clientId === 'string' &&
      typeof loginRequest.sessionId === 'string'
    )

    if (!validFormat) {
      throw new Error('Incorrect login request JSON format')
    }
  } catch (error) {
    console.error(error)
    throw error
  }

  return loginRequest
}

export async function get (code) {
  try {
    const { clientId, sessionId } = parse(code)
    const url = `${Config.OPERATOR_URL}/clients/${clientId}/consents`

    const consent = await axios.get(url)
    return {
      request: { clientId, sessionId },
      consent,
    }
  } catch(error) {
    console.error(error)
    throw error
  }
}

export async function approve({ clientId, sessionId }) {
  const account = await getAccount()
  const accountId = encodeURIComponent(account.id)
  const url = `${Config.OPERATOR_URL}/accounts/${accountId}/login`

  let loginApproval = {
    clientId,
    sessionId,
    timestamp: (new Date()).toISOString(),
  }

  axios.post(url, loginApproval)
}
