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
  const connectionId = v4()
  const connection = await createConnection(
    connectionRequest,
    permissionsResult,
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

function mapReadKeys({ permissions }) {
  return permissions
    .filter(p => p.type === 'READ')
    .reduce(
      (map, { domain, area, jwk }) => map.set(`${domain}|${area}`, jwk),
      new Map()
    )
}

export async function createPermissionResult(
  { local = [], external = [] },
  connectionRequest
) {
  const extractPermissions = (permissions, { read, write }) => [
    ...permissions,
    read,
    write,
  ]

  // const withJwk = async permission => {
  const withJwk = async () => {
    const key = await generateKey({ use: 'enc' })
    const publicKey = toPublicKey(key)

    /* TODO(@all): Store these in the app with the key from permission */
    return publicKey
  }

  const notUndefined = value => value !== undefined

  const readServiceReadKeysByArea = mapReadKeys(connectionRequest)

  return {
    approved: await Promise.all(
      [
        ...local.reduce(extractPermissions, []).filter(notUndefined),
        ...external.reduce(extractPermissions, []).filter(notUndefined),
      ].map(async p => {
        if (p.type === 'WRITE') {
          if (!p.jwks) {
            p.jwks = {
              keys: [],
            }
          }
          // push service read-keys to jwks-keys
          p.jwks.keys.push(
            readServiceReadKeysByArea.get(`${p.domain}|${p.area}`)
          )

          // push user read-key
          p.jwks.keys.push(await withJwk(p))
        }
        return p
      })
    ),
  }
}
