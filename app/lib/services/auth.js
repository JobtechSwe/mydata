import { verify, sign } from './jwt'
import { getConnections } from './storage'
import { getAccount } from './account'
import axios from 'axios'

export const verifyAndParseAuthRequest = async jwt => {
  const { payload } = await verify(jwt)
  return payload
}

export const hasConnection = async authReq => {
  const connections = await getConnections()
  return connections.includes(authReq.iss)
}

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

export const initRegistration = async authRequest => {
  const registrationInit = await createConnectionInit(authRequest)
  try {
    await axios.post(authRequest.eventsURI, registrationInit, { headers: { 'content-type': 'application/jwt' } })
  } catch (error) {
    console.error(error)
    throw Error('CONNECTION_INIT failed')
  }
}
