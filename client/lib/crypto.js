const {
  createCipheriv,
  createDecipheriv,
  publicEncrypt,
  privateDecrypt,
  randomBytes,
  generateKeyPair,
  createHash
} = require('crypto')
const { promisify } = require('util')
const pem2jwk = require('pem-jwk').pem2jwk

async function generateDocumentKey (encoding) {
  const key = await promisify(randomBytes)(32)
  return encoding ? key.toString(encoding) : key
}

function encryptDocumentKey (aesDocumentKey, pubEncryptionKey, encoding) {
  if (typeof aesDocumentKey === 'string') aesDocumentKey = Buffer.from(aesDocumentKey, 'base64')
  const encrypted = publicEncrypt(pubEncryptionKey, aesDocumentKey)
  return encoding ? encrypted.toString('base64') : encrypted
}

function decryptDocumentKey (pubEncryptedDocumentKey, privDecryptionKey, encoding) {
  if (typeof pubEncryptedDocumentKey === 'string') pubEncryptedDocumentKey = Buffer.from(pubEncryptedDocumentKey, 'base64')
  const decrypted = privateDecrypt(privDecryptionKey, pubEncryptedDocumentKey)
  return encoding ? decrypted.toString(encoding) : decrypted
}

async function encryptDocument (aesKey, data, encoding) {
  data = JSON.stringify(data)
  if (typeof aesKey === 'string') aesKey = Buffer.from(aesKey, 'base64')
  const iv = await promisify(randomBytes)(16)
  const cipher = createCipheriv('aes-256-cbc', aesKey, iv)
  const buf = Buffer.concat([iv, cipher.update(data), cipher.final()])
  return encoding ? buf.toString(encoding) : buf
}

function decryptDocument (aesKey, data) {
  if (typeof data === 'string') data = Buffer.from(data, 'base64')
  const iv = data.slice(0, 16)
  const decipher = createDecipheriv('aes-256-cbc', aesKey, iv)
  const dataString = Buffer.concat([
    decipher.update(data.slice(16)),
    decipher.final()
  ]).toString('utf8')
  return JSON.parse(dataString)
}

async function generateJwkPair (jwksUrl, { use }, modulusLength) {
  if (!(use === 'enc' || use === 'sig')) {
    throw Error('"use" has to be "enc" or "sig"')
  }
  if (!modulusLength) {
    throw Error('modulusLength has to be provided')
  }
  const { publicKey, privateKey } = await promisify(generateKeyPair)('rsa', {
    modulusLength,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
  })

  const kid = `${jwksUrl}/${use}_${createHash('SHA256').update(publicKey).digest('hex')}`

  return {
    publicKey: pem2jwk(publicKey, { use, kid }),
    privateKey: pem2jwk(privateKey, { use, kid })
  }
}

function toBase64Url (base64) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function thumbprint ({ e, kty, n }) {
  const hash = await createHash('SHA256')
    .update(JSON.stringify({ e, kty, n }))
    .digest('base64')
  return toBase64Url(hash)
}

async function generateKey (jwksURI, options = {}, modulusLength = 2048) {
  const { privateKey } = await promisify(generateKeyPair)('rsa', {
    modulusLength,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
  })
  const key = pem2jwk(privateKey, options)
  key.kid = `${jwksURI}/${await thumbprint(key)}`

  return key
}

function toPublicKey ({ e, kid, kty, n, use }) {
  return { e, kid, kty, n, use }
}

module.exports = {
  generateJwkPair,
  generateDocumentKey,
  encryptDocumentKey,
  decryptDocumentKey,
  encryptDocument,
  decryptDocument,

  generateKey,
  toPublicKey
}
