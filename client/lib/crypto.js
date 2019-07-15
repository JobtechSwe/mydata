const {
  generateKeyPair,
  createHash
} = require('crypto')
const { promisify } = require('util')
const pem2jwk = require('pem-jwk').pem2jwk

function toBase64Url (base64) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function thumbprint ({ e, kty, n }) {
  const hash = createHash('SHA256')
    .update(JSON.stringify({ e, kty, n }))
    .digest('base64')
  return toBase64Url(hash)
}

async function generateKey (jwksURI, options = {}, modulusLength = 2048) {
  if (!jwksURI && !options.kid) {
    throw new Error('jwksURI must be passed in')
  }
  if (!options || !options.use) {
    throw new Error('{ use } must be passed as an option')
  }
  const { privateKey } = await promisify(generateKeyPair)('rsa', {
    modulusLength,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
  })
  const key = pem2jwk(privateKey, options)
  if (!key.kid) {
    key.kid = `${jwksURI}/${await thumbprint(key)}`
  }

  return key
}

function toPublicKey ({ e, kid, kty, n, use }) {
  return { e, kid, kty, n, use }
}

function importPEM (pem, jwksURI, options) {
  if (!jwksURI) {
    throw new Error('jwksURI must be passed in')
  }
  if (!options || !options.use) {
    throw new Error('{ use } must be passed as an option')
  }
  const jwk = pem2jwk(pem)
  return {
    ...jwk,
    kid: `${jwksURI}/${thumbprint(jwk)}`,
    ...options
  }
}

module.exports = {
  generateKey,
  toPublicKey,
  importPEM
}
