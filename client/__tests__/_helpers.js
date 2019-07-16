const crypto = require('crypto')

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
const base64ToJson = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf8'))

const verifySignature = ({ data, signature }, publicKey) => {
  return crypto.createVerify(signature.alg)
    .update(JSON.stringify(data))
    .verify(publicKey, signature.data, 'base64')
}

module.exports = {
  jsonToBase64,
  base64ToJson,

  verifySignature
}
