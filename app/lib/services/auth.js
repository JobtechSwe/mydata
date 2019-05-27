import { sign, verify } from './jwt'
import { getAccount } from './account'
import { getConnections } from './storage'
import Config from 'react-native-config'
import axios from 'axios'
import { v4 } from 'uuid'

const nowSeconds = () => Math.round(Date.now() / 1000)

const createConnectionInit = async ({ aud, iss, sid }) => {
  const { keys } = await getAccount()

  const now = nowSeconds()
  const jwt = await sign({
    type: 'CONNECTION_INIT',
    aud: iss,
    iss: aud,
    sid,
    iat: now,
    exp: now + 60,
  }, keys.privateKey, { jwk: keys.publicKey, alg: 'RS256' })

  return jwt
}

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
  const { keys, id } = await getAccount()

  // ...
  const connectionId = v4()
  const connection = await sign({
    type: 'CONNECTION',
    aud: iss,
    iss: 'mydata://account',
    sub: connectionId,
    sid,
  }, keys.privateKey,
    {
      jwk: keys.publicKey,
      alg: 'RS256',
    })

  const connectionResponse = await sign({
    type: 'CONNECTION_RESPONSE',
    aud: Config.OPERATOR_URL,
    iss: `mydata://account/${id}`,
    payload: connection,
  }, keys.privateKey,
    {
      jwk: keys.publicKey,
      alg: 'RS256',
    })

  await axios.post(Config.OPERATOR_URL, connectionResponse,
    { headers: { 'content-type': 'application/jwt' } })
}
