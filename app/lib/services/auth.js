import { verify, decode, sign } from 'jwt-lite'
import { getKey } from './getKey'
import { getConnections, getAccount } from './storage'
import axios from 'axios'
import pem2jwk from 'simple-pem2jwk'

export const verifyAndParseAuthRequest = async jwt => {
  // TODO: Validate message with @mydata/messaging
  const { header } = await decode(jwt)
  const publicKey = await getKey(header.kid)
  return verify(jwt, publicKey)
}

export const hasConnection = async authReq => {
  const connections = await getConnections()
  return connections.includes(authReq.iss)
}

const nowSeconds = () => Math.round(Date.now() / 1000)

const createRegistrationInit = async ({ aud, iss, jti }) => {
  const { keys } = await getAccount()

  const privateJwk = await pem2jwk(keys.privateKey)
  const publicJwk = await pem2jwk(keys.publicKey, { use: 'sig' })

  const now = nowSeconds()

  const jwt = await sign({
    type: 'REGISTRATION_INIT',
    aud: iss,
    iss: aud,
    jti,
    iat: now,
    exp: now + 60,
  }, privateJwk, { jwk: publicJwk, alg: 'RS256' })

  return jwt
}

export const initRegistration = async authRequest => {
  const registrationInit = await createRegistrationInit(authRequest)
  await axios.post(authRequest.events, registrationInit, { headers: { 'content-type': 'application/jwt' } })
}
