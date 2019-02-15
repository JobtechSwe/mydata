const crypto = require('crypto')
const { promisify } = require('util')

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
const base64ToJson = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf8'))

const generateKeyPair = async ({ kid, use } = {}) => {
  const keyPair = await promisify(crypto.generateKeyPair)('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
  })
  if (kid) keyPair.kid = kid
  if (use) keyPair.use = use
  return keyPair
}

const verifySignature = ({ data, signature }, publicKey) => {
  return crypto.createVerify(signature.alg)
    .update(JSON.stringify(data))
    .verify(publicKey, signature.data, 'base64')
}

module.exports = {
  jsonToBase64,
  base64ToJson,

  generateKeyPair,
  verifySignature
}
