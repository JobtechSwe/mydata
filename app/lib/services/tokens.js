import { sign } from './jwt'
import { getAccount } from './account'
import Config from 'react-native-config'

const nowSeconds = () => Math.round(Date.now() / 1000)

export const createAccountRegistration = async (newAccount) => {
  return sign(
    {
      type: 'ACCOUNT_REGISTRATION',
      aud: Config.OPERATOR_URL,
      iss: `mydata://account/${newAccount.id}`,
      pds: newAccount.pds,
    },
    newAccount.keys.privateKey,
    {
      jwk: newAccount.keys.publicKey,
    }
  )
}

export const createConnectionInit = async ({ aud, iss, sid }) => {
  const { keys } = await getAccount()

  const now = nowSeconds()
  return sign({
    type: 'CONNECTION_INIT',
    aud: iss,
    iss: aud,
    sid,
    iat: now,
    exp: now + 60,
  }, keys.privateKey, { jwk: keys.publicKey, alg: 'RS256' })
}

export const createConnection = async ({ iss, sid }, connectionId) => {
  const { keys } = await getAccount()

  return sign({
    type: 'CONNECTION',
    aud: iss,
    iss: 'mydata://account',
    sid,
    sub: connectionId,
  }, keys.privateKey, { jwk: keys.publicKey, alg: 'RS256' })
}

export const createConnectionResponse = async (payload) => {
  const { keys, id } = await getAccount()

  return sign({
    type: 'CONNECTION_RESPONSE',
    aud: Config.OPERATOR_URL,
    iss: `mydata://account/${id}`,
    payload,
  }, keys.privateKey, { jwk: keys.publicKey, alg: 'RS256' })
}

export const createLogin = async ({ serviceId, connectionId }, sessionId) => {
  if (!sessionId) {
    throw Error('SessionId is missing')
  }
  const { keys } = await getAccount()
  return sign({
    type: 'LOGIN',
    aud: serviceId,
    sid: sessionId,
    sub: connectionId,
    iss: 'mydata://account',
  }, keys.privateKey, { jwk: keys.publicKey, alg: 'RS256' })
}

export const createLoginResponse = async (loginPayload) => {
  const { keys, id } = await getAccount()
  return sign({
    type: 'LOGIN_RESPONSE',
    payload: loginPayload,
    iss: `mydata://account/${id}`,
    aud: Config.OPERATOR_URL,
  }, keys.privateKey, { jwk: keys.publicKey, alg: 'RS256' })
}