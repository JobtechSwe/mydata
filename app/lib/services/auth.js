import { verify } from './jwt'
import { getConnections, storeConnection } from './storage'
import Config from 'react-native-config'
import axios from 'axios'
import { createConnectionInit, createConnection, createConnectionResponse, createLogin, createLoginResponse } from './tokens'
import { v4 } from 'uuid'

export const authenticationRequestHandler = async ({ payload }) => {
  const allConnections = await getConnections()
  const existingConnection = allConnections.find(x => x.serviceId === payload.iss)
  if (existingConnection) {
    return { existingConnection, sessionId: payload.sid }
  } else {
    const connectionRequest = await initConnection(payload)
    return { connectionRequest, sessionId: payload.sid }
  }
}

export const initConnection = async authRequest => {
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

export const approveConnection = async (connectionRequest) => {
  const connectionId = v4()
  const connection = await createConnection(connectionRequest, connectionId)
  const connectionResponse = await createConnectionResponse(connection)

  await axios.post(Config.OPERATOR_URL, connectionResponse,
    { headers: { 'content-type': 'application/jwt' } })

  await storeConnection({
    serviceId: connectionRequest.iss,
    connectionId,
  })
}

export const approveLogin = async ({ connection, sessionId }) => {
  try {
    const login = await createLogin(connection, sessionId)
    const loginResponse = await createLoginResponse(login)
    await axios.post(Config.OPERATOR_URL, loginResponse,
      { headers: { 'content-type': 'application/jwt' } })
  } catch (error) {
    console.error('error', error)
    throw Error('Could not approve Login')
  }
}
