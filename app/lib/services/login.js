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

export async function get(code) {
  const { clientId, sessionId } = parse(code)
  const account = await getAccount()
  const url = `${Config.OPERATOR_URL}/clients/${encodeURIComponent(clientId)}/consents?accountId=${account.id}`
  try {
    const { data } = await axios.get(url)
    if (!data.length) {
      throw new Error('No consents found')
    }
    return {
      request: { clientId, sessionId },
      consent: data[0],
    }
  } catch(error) {
    console.log(url, error)
    throw error
  }
}

export async function approve({ clientId, sessionId, consentId }) {
  const account = await getAccount()
  const url = `${Config.OPERATOR_URL}/accounts/${account.id}/login`

  let loginApproval = {
    clientId,
    consentId,
    sessionId,
    timestamp: (new Date()).toISOString(),
  }

  axios.post(url, loginApproval)
}
