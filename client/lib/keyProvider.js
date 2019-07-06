const { generateKey, importPEM, toPublicKey } = require('./crypto')
const Joi = require('@hapi/joi')

const KEY_PREFIX = 'key|>'
const WRITE_KEYS_PREFIX = 'permissionId|>'

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

const rxPEM = /^-----BEGIN RSA PRIVATE KEY-----\n([a-zA-Z0-9+/=]*\n)*-----END RSA PRIVATE KEY-----\n?$/

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
const base64ToJson = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf8'))

function importClientKey (key, jwksURI) {
  const options = { use: 'sig', kid: `${jwksURI}/client_key` }
  if (typeof key === 'string' && rxPEM.test(key)) {
    return importPEM(key, jwksURI, options)
  } else if (typeof key === 'object') {
    return {
      ...key,
      ...options
    }
  } else {
    throw new Error('Unknown key format')
  }
}

class KeyProvider {
  constructor ({ clientKey, keyValueStore, keyOptions, jwksURI, alg }) {
    this.jwksURI = jwksURI
    this.clientKey = importClientKey(clientKey, jwksURI)
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
      return this.clientKey
    }
    if (!await isUrl(kid)) {
      kid = `${this.jwksURI}/${kid}`
    }
    return this.load(`${KEY_PREFIX}${kid}`)
  }
  async generatePersistentKey ({ use }) {
    const key = await generateKey(this.jwksURI, { use }, this.options.modulusLength)
    await this.save(`${KEY_PREFIX}${key.kid}`, key)
    return key
  }
  async generateTemporaryKey ({ use }) {
    const key = await generateKey(this.jwksURI, { use }, this.options.modulusLength)
    await this.save(`${KEY_PREFIX}${key.kid}`, key, this.options.tempKeyExpiry)
    return key
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
  async saveWriteKeys (domain, area, jwks) {
    await this.save(`${WRITE_KEYS_PREFIX}${domain}|${area}`, jwks)
    return jwks
  }
  async getWriteKeys (domain, area) {
    return this.load(`${WRITE_KEYS_PREFIX}${domain}|${area}`)
  }
  async jwksKeyList () {
    return { keys: [ toPublicKey(this.clientKey) ] }
  }
  async jwksKey (kid) {
    let key
    if (kid === 'client_key') {
      key = this.clientKey
    } else {
      key = await this.load(`${KEY_PREFIX}${kid}`)
    }
    return key && toPublicKey(key)
  }
  async getSigningKey (/* domain, area */) {
    // TODO: Create different signing keys for different domains/areas
    //          and/or rotate
    return this.clientKey
  }
}

module.exports = KeyProvider
