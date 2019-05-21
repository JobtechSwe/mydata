import { token } from '@mydata/messaging'
import * as jwt from 'jwt-lite'
import { importKey } from 'jwk-lite'

const { sign, verify } = token({
  sign: jwt.sign,
  decode: jwt.decode,
  verify: jwt.verify,
  importKey,
})

export async function createAccountToken () {
  
}