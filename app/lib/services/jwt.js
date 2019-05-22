import { token } from '@mydata/messaging'
import * as jwt from 'jwt-lite'
import { importKey } from 'jwk-lite'
import pem2jwk from 'simple-pem2jwk'
import Config from 'react-native-config'

const { sign, verify } = token({
  sign: jwt.sign,
  decode: jwt.decode,
  verify: jwt.verify,
  importKey,
})

export const createAccountToken = async (account) => {
  const privateJwk = pem2jwk(account.keys.privateKey)
  const publicJwk = pem2jwk(account.keys.publicKey, { use: 'sig' })
  return sign(
  {
    type: 'ACCOUNT_REGISTRATION',
    aud: Config.OPERATOR_URL,
    iss: `mydata://account/${account.id}`,
    pds: account.pds,
  },
  privateJwk,
  {
    jwk: publicJwk,
  }
)}
