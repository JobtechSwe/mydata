import Config from 'react-native-config'
import axios from 'axios'
import { getAccount } from './storage'
import { Base64 } from 'js-base64'

export function parse (code) {
  const loginRequest = JSON.parse(Base64.decode(code))

  try {
    let validFormat = (typeof loginRequest.clientId === 'string' &&
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

export async function approve({ clientId, sessionId }) {
  const operatorUrl = encodeURI(Config.OPERATOR_URL)
  const account = await getAccount()
  const accountId = encodeURIComponent(account.id)
  const url = `${operatorUrl}/accounts/${accountId}/login`

  let loginApproval = {
    clientId,
    sessionId,
    timeStamp: Date.now(),
  }

  axios.post(url, loginApproval)
}
