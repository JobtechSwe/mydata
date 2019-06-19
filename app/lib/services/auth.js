import { verify } from './jwt'
import { getConnections, storeConnection } from './storage'
import Config from 'react-native-config'
import axios from 'axios'
import {
  createConnectionInit,
  createConnection,
  createConnectionResponse,
  createLogin,
  createLoginResponse,
} from './tokens'
import { v4 } from 'uuid'
import { generateKey, toPublicKey } from './crypto'

export const authenticationRequestHandler = async ({ payload }) => {
  const allConnections = await getConnections()
  const existingConnection = allConnections.find(
    x => x.serviceId === payload.iss
  )

  if (existingConnection) {
    return { existingConnection, sessionId: payload.sid }
  } else {
    const connectionRequest = await initConnection(payload)
    return { connectionRequest, sessionId: payload.sid }
  }
}

export const initConnection = async authRequest => {
  const connectionInit = await createConnectionInit(authRequest)
  try {
    const { data } = await axios.post(authRequest.eventsURI, connectionInit, {
      headers: { 'content-type': 'application/jwt' },
    })
    const { payload } = await verify(data)
    return payload
  } catch (error) {
    console.error(error)
    throw Error('CONNECTION_INIT failed')
  }
}

export const approveConnection = async (
  connectionRequest,
  permissionsResult
) => {
  const withJwk = async permission => {
    const key = await generateKey({ use: 'enc' })
    const publicKey = toPublicKey(key)

    return { ...permission, jwks: { keys: [publicKey] } }
  }

  const approvedReads = permissionsResult.approved.filter(
    x => x.type === 'READ'
  )

  const approvedWrites = await Promise.all(
    permissionsResult.approved.filter(x => x.type === 'WRITE').map(withJwk)
  )

  const connectionId = v4()
  const connection = await createConnection(
    connectionRequest,
    [...approvedReads, ...approvedWrites],
    connectionId
  )

  const connectionResponse = await createConnectionResponse(connection)

  await axios.post(Config.OPERATOR_URL, connectionResponse, {
    headers: { 'content-type': 'application/jwt' },
  })

  await storeConnection({
    serviceId: connectionRequest.iss,
    connectionId,
  })
}

export const approveLogin = async ({ connection, sessionId }) => {
  try {
    const login = await createLogin(connection, sessionId)
    const loginResponse = await createLoginResponse(login)
    await axios.post(Config.OPERATOR_URL, loginResponse, {
      headers: { 'content-type': 'application/jwt' },
    })
  } catch (error) {
    console.error('error', error)
    throw Error('Could not approve Login')
  }
}
