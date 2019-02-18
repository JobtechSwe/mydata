import { RSA } from 'react-native-rsa-native'

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


/* TODO(@einarpersson): implement these
export async function encrypt (data, publicKey) {

}

export async function decrypt (cipher, privateKey) {

}
*/