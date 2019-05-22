import { verify, sign } from './jwt'
import { getConnections } from './storage'
import { getAccount } from './account'
import axios from 'axios'
import pem2jwk from 'simple-pem2jwk'

export const verifyAndParseAuthRequest = async jwt => {
  return verify(jwt)
}

export const hasConnection = async authReq => {
  const connections = await getConnections()
  return connections.includes(authReq.iss)
}

const nowSeconds = () => Math.round(Date.now() / 1000)

const createConnectionInit = async ({ aud, iss, sid }) => {
  const { keys } = await getAccount()

  const privateJwk = await pem2jwk(keys.privateKey)
  const publicJwk = await pem2jwk(keys.publicKey, { use: 'sig' })

  const now = nowSeconds()

  const jwt = await sign({
    type: 'CONNECTION_INIT',
    aud: iss,
    iss: aud,
    sid,
    iat: now,
    exp: now + 60,
  }, privateJwk, { jwk: publicJwk, alg: 'RS256' })

  return jwt
}

export const initRegistration = async authRequest => {
  const registrationInit = await createConnectionInit(authRequest)
  await axios.post(authRequest.events, registrationInit, { headers: { 'content-type': 'application/jwt' } })
}
