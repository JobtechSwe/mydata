import Config from 'react-native-config'
import axios from 'axios'
import { getAccount } from './storage'

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

export async function approve({ clientId, sessionId }) {
  const operatorUrl = encodeURI(Config.OPERATOR_URL)
  const account = await getAccount()
  const accountId = encodeURIComponent(account.id)
  const url = `${operatorUrl}/accounts/${accountId}/login`
  // todo: put actual data in POST

  let loginApproval = {
    clientId,
    sessionId,
    timeStamp: Date.now(),
  }

  axios.post(url, loginApproval)
}
