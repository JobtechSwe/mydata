import { sign } from './jwt'
import { getAccount, getAccountKeys } from './storage'
import Config from 'react-native-config'

const nowSeconds = () => Math.round(Date.now() / 1000)

export const createAccountRegistration = async (
  // eslint-disable-next-line camelcase
  { id, pds: { provider, access_token } },
  { publicKey, privateKey }
) => {
  return sign(
    {
      type: 'ACCOUNT_REGISTRATION',
      aud: Config.OPERATOR_URL,
      iss: `mydata://account/${id}`,
      pds: { provider, access_token },
    },
    privateKey,
    {
      jwk: publicKey,
    }
  )
}

export const createConnectionInit = async ({ aud, iss, sid }) => {
  const { publicKey, privateKey } = await getAccountKeys()

  const now = nowSeconds()
  return sign(
    {
      type: 'CONNECTION_INIT',
      aud: iss,
      iss: aud,
      sid,
      iat: now,
      exp: now + 60,
    },
    privateKey,
    { jwk: publicKey, alg: 'RS256' }
  )
}

export const createConnection = async (
  { iss, sid },
  permissions,
  connectionId
) => {
  const { publicKey, privateKey } = await getAccountKeys()
  const body = {
    type: 'CONNECTION',
    aud: iss,
    iss: 'mydata://account',
    sid,
    sub: connectionId,
    permissions,
  }

  return sign(body, privateKey, { jwk: publicKey, alg: 'RS256' })
}

export const createConnectionResponse = async payload => {
  const { id } = await getAccount()
  const { publicKey, privateKey } = await getAccountKeys()

  return sign(
    {
      type: 'CONNECTION_RESPONSE',
      aud: Config.OPERATOR_URL,
      iss: `mydata://account/${id}`,
      payload,
    },
    privateKey,
    { jwk: publicKey, alg: 'RS256' }
  )
}

export const createLogin = async ({ serviceId, connectionId }, sessionId) => {
  if (!sessionId) {
    throw Error('SessionId is missing')
  }
  const { publicKey, privateKey } = await getAccountKeys()
  return sign(
    {
      type: 'LOGIN',
      aud: serviceId,
      sid: sessionId,
      sub: connectionId,
      iss: 'mydata://account',
    },
    privateKey,
    { jwk: publicKey, alg: 'RS256' }
  )
}

export const createLoginResponse = async loginPayload => {
  const { id } = await getAccount()
  const { publicKey, privateKey } = await getAccountKeys()

  return sign(
    {
      type: 'LOGIN_RESPONSE',
      payload: loginPayload,
      iss: `mydata://account/${id}`,
      aud: Config.OPERATOR_URL,
    },
    privateKey,
    { jwk: publicKey, alg: 'RS256' }
  )
}
