import { sign, verify } from './jwt'
import { getAccount } from './account'
import { getConnections } from './storage'
import axios from 'axios'

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
