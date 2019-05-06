import { verify, decode } from 'jwt-lite'
import { getKey } from './getKey'
import { getConnections } from './storage'
import { Base64 } from 'js-base64'
import axios from 'axios'

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

const createRegistrationInit = ({ aud }) => {
  const header = { typ: 'JWT', alg: 'none' }
  const payload = { type: 'REGISTRATION_INIT', aud }
  const signature = ''

  return `${Base64.encodeURI(JSON.stringify(header))}.${Base64.encodeURI(JSON.stringify(payload))}.${Base64.encodeURI(signature)}`
}

export const initRegistration = async authRequest => {
  const registrationInit = createRegistrationInit(authRequest)
  const { data } = await axios.post(authRequest.events, registrationInit, { headers: { contentType: 'application/jwt' } })
  return data
}
