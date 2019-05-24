import { token } from '@mydata/messaging'
import * as jwt from 'jwt-lite'
import Config from 'react-native-config'

export const { sign, verify } = token({
  sign: jwt.sign,
  decode: jwt.decode,
  verify: jwt.verify,
})

export const createAccountToken = async (account) => {
  return sign(
  {
    type: 'ACCOUNT_REGISTRATION',
    aud: Config.OPERATOR_URL,
    iss: `mydata://account/${account.id}`,
    pds: account.pds,
  },
  account.keys.privateKey,
  {
    jwk: account.keys.publicKey,
  }
)}
