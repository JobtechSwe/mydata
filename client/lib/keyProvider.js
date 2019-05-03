const { generateKeyPair, createHash } = require('crypto')
const { decryptDocumentKey } = require('./crypto')
const { promisify } = require('util')
const { serialize } = require('jwks-provider')
const Joi = require('joi')

const KEY_PREFIX = 'key|>'
const ACCESS_KEY_IDS_PREFIX = 'accessKeyIds|>'
const DOCUMENT_KEYS_PREFIX = 'documentKeys|>'
const CONSENT_KEY_ID_PREFIX = 'consentKeyId|>'

const defaults = {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  tempKeyExpiry: 10 * 60 * 1000
}

function generateKid (jwksUrl, use, publicKey) {
  return `${jwksUrl}/${use}_${createHash('SHA256').update(publicKey).digest('hex')}`
}

async function isUrl (kid) {
  const schema = Joi.string().uri({ allowRelative: false })
  try {
    await schema.validate(kid)
    return true
  } catch (_) {
    return false
  }
}

async function generateKeyPairObject (jwksUrl, { kid, use }, { modulusLength, publicKeyEncoding, privateKeyEncoding }) {
  const { publicKey, privateKey } = await promisify(generateKeyPair)('rsa', {
    modulusLength,
    publicKeyEncoding,
    privateKeyEncoding
  })
  kid = kid || generateKid(jwksUrl, use, publicKey)
  if (!await isUrl(kid)) {
    kid = `${jwksUrl}/${kid}`
  }
  return {
    publicKey,
    privateKey,
    use,
    kid
  }
}

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
const base64ToJson = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf8'))

class KeyProvider {
  constructor ({ clientKeys, keyValueStore, keyOptions, jwksUrl }) {
    this.jwksUrl = jwksUrl
    this.clientKeys = {
      use: 'sig',
      kid: `${jwksUrl}/client_key`,
      publicKey: clientKeys.publicKey,
      privateKey: clientKeys.privateKey
    }
    this.options = Object.assign({}, defaults, keyOptions)
    this.keyValueStore = keyValueStore
  }
  async load (key) {
    const value = await this.keyValueStore.load(key)
    return value ? base64ToJson(value) : value
  }
  async save (key, value, ttl) {
    return this.keyValueStore.save(key, jsonToBase64(value), ttl)
  }
  async getKey (kid) {
    if (kid === 'client_key') {
      return this.clientKeys
    }
    if (!await isUrl(kid)) {
      kid = `${this.jwksUrl}/${kid}`
    }
    return this.load(`${KEY_PREFIX}${kid}`)
  }
  async generateKey ({ use, kid }) {
    const key = await generateKeyPairObject(this.jwksUrl, { use, kid }, this.options)
    await this.save(`${KEY_PREFIX}${key.kid}`, key)
    return key
  }
  async generateTempKey ({ use, kid }) {
    const key = await generateKeyPairObject(this.jwksUrl, { use, kid }, this.options)
    await this.save(`${KEY_PREFIX}${key.kid}`, key, this.options.tempKeyExpiry)
    return key
  }
  async saveKey (key) {
    return this.save(`${KEY_PREFIX}${key.kid}`, key)
  }
  async removeKey (kid) {
    await this.keyValueStore.remove(`${KEY_PREFIX}${kid}`)
  }
  async saveConsentKeyId (consentId, kid) {
    return this.save(`${CONSENT_KEY_ID_PREFIX}${consentId}`, kid)
  }
  async getConsentKeyId (consentId) {
    const consentKeyId = await this.load(`${CONSENT_KEY_ID_PREFIX}${consentId}`)
    if (!consentKeyId) {
      throw new Error('No key found for consent')
    }
    return consentKeyId
  }
  async saveAccessKeyIds (consentId, domain, area, keys) {
    const key = [consentId, domain, area].join('|')
    return this.save(`${ACCESS_KEY_IDS_PREFIX}${key}`, keys)
  }
  async getAccessKeyIds (consentId, domain, area) {
    const key = [consentId, domain, area].join('|')
    const accessKeyIds = await this.load(`${ACCESS_KEY_IDS_PREFIX}${key}`)
    return accessKeyIds || []
  }
  async getAccessKeys (consentId, domain, area) {
    const accessKeyIds = await this.getAccessKeyIds(consentId, domain, area)
    return Promise.all(
      accessKeyIds.map(async (kid) => this.load(`${KEY_PREFIX}${kid}`))
    )
  }
  async saveDocumentKeys (consentId, domain, area, keys) {
    const key = [consentId, domain, area].join('|')
    return this.save(`${DOCUMENT_KEYS_PREFIX}${key}`, keys)
  }
  async getDocumentKeys (consentId, domain, area) {
    const key = [consentId, domain, area].join('|')
    return this.load(`${DOCUMENT_KEYS_PREFIX}${key}`)
  }
  async getDocumentEncryptionKey (consentId, domain, area) {
    const documentKeys = await this.getDocumentKeys(consentId, domain, area)
    const [kid, encDocumentKey] = Object
      .entries(documentKeys)
      .find(([kid]) => kid.match(new RegExp(`^${this.jwksUrl}`)))
    const keyPair = await this.getKey(kid)
    return decryptDocumentKey(encDocumentKey, keyPair.privateKey)
  }
  async getDocumentDecryptionKey (b64DocumentKeys, consentKid) {
    if (!consentKid) {
      throw new Error('No consent key id provided')
    }
    const documentKeys = base64ToJson(b64DocumentKeys)
    if (!documentKeys) {
      throw new Error('No document keys found')
    }
    const encDocumentKey = documentKeys[consentKid]
    if (!encDocumentKey) {
      throw new Error('No matching decryption key found')
    }
    const keyPair = await this.getKey(consentKid)
    return decryptDocumentKey(encDocumentKey, keyPair.privateKey)
  }
  async jwksKeyList () {
    return serialize([this.clientKeys])
  }

  async jwksKey (kid) {
    if (kid === 'client_key') {
      const publicKey = {
        alg: 'RS256',
        e: 'AQAB',
        ext: true,
        key_ops: ['verify'],
        kty: 'RSA',
        n: 'p0V6QDPjsjB2CddNxzjUVXKpGAODmqjS0QPMGSDXD_bR_kTyA2zwt2bKOyIyuOvmy8kp7En7hEebopKH9codgGnlZBV47xeyk24NaqI9ZTelrXjXOBjhNF13vTCaVTEI4a9-YFZhi_y07I-QJRU1k6c8vWLEQ6HljboX7YCtN6T1tUzu9-ZZ7qwbHZhZHN4YbbGQfmXJMflzzJ6FnT1qKmtt9zwrMgqhm_KXVuGq9G1LzWFo06nCZD3xJSwFT5d8qbG9gC3jHFaGF_1Vr3ywMAzkO2xGuOuuG0Rq1Nbl_n0yFCgBzYG6q7wEnMc1FUTfOBwj0Cj9CmT_VGSfTPjDoQ',
      }
      return {
        ...publicKey,
        kid: `${this.jwksUrl}/client_key`,
        use: 'sig'
      }
    } else {
      const key = await this.getKey(kid)
      return key ? serialize([key]).keys[0] : null
    }
  }
}

module.exports = KeyProvider
