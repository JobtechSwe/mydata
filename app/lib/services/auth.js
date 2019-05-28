import { verify } from './jwt'
import { getConnections } from './storage'
import Config from 'react-native-config'
import axios from 'axios'
import { createConnectionInit, createConnection, createConnectionResponse } from './tokens'

export const authenticationRequestHandler = async ({ payload, header }) => {
  const existingConnections = await getConnections()
  const hasConnection = existingConnections.includes(payload.iss)
  return { payload, header, hasConnection }
}

export const initRegistration = async authRequest => {
  const registrationInit = await createConnectionInit(authRequest)
  try {
    const { data } = await axios.post(authRequest.eventsURI, registrationInit, { headers: { 'content-type': 'application/jwt' } })
    const { payload } = await verify(data)
    return payload
  } catch (error) {
    console.error(error)
    throw Error('CONNECTION_INIT failed')
  }
}

export const approveConnection = async ({ sid, iss }) => {
  const connection = await createConnection({ sid, iss })
  const connectionResponse = await createConnectionResponse(connection)

  await axios.post(Config.OPERATOR_URL, connectionResponse,
    { headers: { 'content-type': 'application/jwt' } })
}
