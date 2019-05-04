import { verify, decode } from 'jwt-lite'
import { getKey } from './getKey'
import { getConnections } from './storage'
import { Base64 } from 'js-base64'

export const handleJwt = async jwt => {
  const { header } = await decode(jwt)
  const publicKey = await getKey(header.kid)
  const verifiedAuthReq = await verify(jwt, publicKey)
  return verifiedAuthReq
}

export const hasConnection = async authReq => {
  const connections = await getConnections()
  return connections.includes(authReq.iss)
}

export const createConnectionInfoRequest = ({ aud }) => {
  const header = {
      typ: 'JWT',
      alg: 'none',
  }
  const payload = {
      type: 'CONNECTION_INFO_REQUEST',
      aud,
    }
  const signature = ''

  return `${Base64.encodeURI(JSON.stringify(header))}.${Base64.encodeURI(JSON.stringify(payload))}.${Base64.encodeURI(signature)}`
}

