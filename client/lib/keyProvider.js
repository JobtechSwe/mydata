const { decryptDocumentKey, generateJwkPair } = require('./crypto')
const { serialize } = require('jwks-provider')
const Joi = require('@hapi/joi')
const { JWK } = require('@panva/jose')

const KEY_PREFIX = 'key|>'
const ACCESS_KEY_IDS_PREFIX = 'accessKeyIds|>'
const DOCUMENT_KEYS_PREFIX = 'documentKeys|>'
const CONSENT_KEY_ID_PREFIX = 'consentKeyId|>'

const defaults = {
  tempKeyExpiry: 10 * 60 * 1000,
  modulusLength: 2048
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

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
const base64ToJson = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf8'))

class KeyProvider {
  constructor ({ clientKeys, keyValueStore, keyOptions, jwksUrl, alg }) {
    this.jwksUrl = jwksUrl
    this.clientKeys = {
      use: 'sig',
      kid: `${jwksUrl}/client_key`,
      publicKey: clientKeys.publicKey,
      privateKey: clientKeys.privateKey
    }
    this.options = Object.assign({}, defaults, keyOptions)
    this.keyValueStore = keyValueStore
    this.alg = alg
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
  async generatePersistentKey ({ use }) {
    const keyPair = await generateJwkPair(this.jwksUrl, { use }, this.options.modulusLength)
    await this.save(`${KEY_PREFIX}${keyPair.publicKey.kid}`, keyPair)
    return keyPair
  }
  async generateTemporaryKey ({ use }) {
    const keyPair = await generateJwkPair(this.jwksUrl, { use }, this.options.modulusLength)
    await this.save(`${KEY_PREFIX}${keyPair.publicKey.kid}`, keyPair, this.options.tempKeyExpiry)
    return keyPair
  }
  async makeKeyPermanent (kid) {
    const key = await this.getKey(kid)
    if (!key) {
      throw new Error(`No such key [${kid}]`)
    }
    await this.saveKey(key)
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
      return JWK.importKey(this.clientKeys.publicKey, { kid: `${this.jwksUrl}/client_key`, alg: this.alg })
    } else {
      const key = await this.getKey(kid)
      return key && key.publicKey
    }
  }
}

module.exports = KeyProvider
