import { verify } from './jwt'
import { getConnections, storeConnection, storeKey } from './storage'
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

export const approveConnection = async (connectionRequest, approved) => {
  try {
    const connectionId = v4()
    const permissionsResult = await createPermissionResult(
      connectionRequest,
      approved
    )
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
  } catch (error) {
    console.error(error)
    throw error
  }
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

function mapReadKeys(permissions) {
  return permissions
    .filter(p => p.type === 'READ')
    .reduce((map, { domain, area, jwk }) => {
      return map.set(`${domain}|${area}`, jwk)
    }, new Map())
}

export async function createPermissionResult({ permissions }, approved) {
  if (!permissions) {
    return undefined
  }

  const withJwk = async () => {
    const key = await generateKey({ use: 'enc' })
    await storeKey(key)
    const publicKey = toPublicKey(key)

    return publicKey
  }

  const readServiceReadKeysByArea = mapReadKeys(permissions)

  const permissionResult = await {
    approved: await Promise.all(
      permissions
        .filter(p => approved.get(p.id))
        .map(async p => {
          if (p.type === 'WRITE') {
            if (!p.jwks) {
              p.jwks = {
                keys: [],
              }
            }
            // push service read-keys to jwks-keys
            const serviceReadKey = readServiceReadKeysByArea.get(
              `${p.domain}|${p.area}`
            )
            if (serviceReadKey) {
              p.jwks.keys.push(serviceReadKey)
            }

            // push user read-key
            p.jwks.keys.push(await withJwk())
          } else if (p.type === 'READ') {
            p.kid = p.jwk.kid
            delete p.jwk
          }
          return p
        })
    ),
  }
  return permissionResult.approved.length ? permissionResult : undefined
}
