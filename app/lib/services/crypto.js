import { RSA } from 'react-native-rsa-native'
import pem2jwk from 'simple-pem2jwk'

export async function generateKeys (modulusLength = 2048) {
  const keyPair = await RSA.generateKeys(modulusLength)
  return {
    publicKey: pem2jwk(keyPair.public, { use: 'sig' }),
    privateKey: pem2jwk(keyPair.private),
  }
}

export async function sign (data, kid, privateKey) {
  return {
    kid,
    alg: 'RSA-SHA512',
    data: await RSA.sign(JSON.stringify(data), privateKey),
  }
}

export async function verify (data, signature, publicKey) {
  if (!signature.alg) {
    throw new Error('Signature algorithm must be specified. Only [RSA-SHA512] is supported.')
  }
  if (signature.alg.toLowerCase() !== 'rsa-sha512') {
    throw new Error(`Unsupported algorithm [${signature.alg}]. Only [RSA-SHA512] is supported.`)
  }
  return RSA.verify(signature.data, JSON.stringify(data), publicKey)
}
