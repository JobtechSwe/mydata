import { verify, decode } from 'jwt-lite'
import { getKey } from './getKey'
import { getConnections } from './storage'

export const handleJwt = async jwt => {
  const { header } = await decode(jwt)
  const publicKey = await getKey(header.kid)
  const verifiedAuthReq = await verify(jwt, publicKey)
  return verifiedAuthReq
}

export const canLogin = async authReq => {
  const connections = await getConnections()
  return connections.includes(authReq.iss)
}
