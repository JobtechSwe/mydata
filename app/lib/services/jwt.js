import { token } from '@mydata/messaging'
import * as jwt from 'jwt-lite'

export const { sign, verify } = token({
  sign: jwt.sign,
  decode: jwt.decode,
  verify: jwt.verify,
})
