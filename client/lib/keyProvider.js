const { generateKeyPair } = require('crypto')
const { promisify } = require('util')
const moment = require('moment')
const { serialize } = require('jwks-provider')
const Joi = require('joi')

const defaults = {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  tempKeyExpiry: 10 * 60 * 1000
}

function generateKid (jwksUrl, use) {
  return `${jwksUrl}/${use}_${moment.utc().format('YYYYMMDDHHmmss')}`
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
  kid = kid || generateKid(jwksUrl, use)
  if (!await isUrl(kid)) {
    kid = `${jwksUrl}/${kid}`
  }
  const { publicKey, privateKey } = await promisify(generateKeyPair)('rsa', {
    modulusLength,
    publicKeyEncoding,
    privateKeyEncoding
  })
  return {
    publicKey,
    privateKey,
    use,
    kid
  }
}

module.exports = class KeyProvider {
  constructor ({ clientKeys, keyStore, keyOptions, jwksUrl }) {
    this.jwksUrl = jwksUrl
    this.clientKeys = {
      use: 'sig',
      kid: `${jwksUrl}/client_key`,
      publicKey: clientKeys.publicKey,
      privateKey: clientKeys.privateKey
    }
    this.options = Object.assign({}, defaults, keyOptions)
    this.keyStore = keyStore

    this.getKey = this.getKey.bind(this)
    this.getKeys = this.getKeys.bind(this)
    this.generateKey = this.generateKey.bind(this)
    this.generateTempKey = this.generateTempKey.bind(this)
    this.removeKey = this.removeKey.bind(this)
    this.jwksKeyList = this.jwksKeyList.bind(this)
    this.jwksKey = this.jwksKey.bind(this)
  }
  async getKey (kid) {
    if (kid === 'client_key') {
      return this.clientKeys
    }
    if (!await isUrl(kid)) {
      kid = `${this.jwksUrl}/${kid}`
    }
    return this.keyStore.getKey(kid)
  }
  async getKeys (use) {
    return this.keyStore.getKeys(use)
  }
  async generateKey ({ use, kid }) {
    const key = await generateKeyPairObject(this.jwksUrl, { use, kid }, this.options)
    await this.keyStore.saveKey(key)
    return key
  }
  async generateTempKey ({ use, kid }) {
    const key = await generateKeyPairObject(this.jwksUrl, { use, kid }, this.options)
    await this.keyStore.saveKey(key, this.options.tempKeyExpiry)
    return key
  }
  async removeKey (kid) {
    await this.keyStore.removeKey(kid)
  }
  async jwksKeyList () {
    const sigKeys = await this.keyStore.getKeys('sig')

    return serialize([this.clientKeys, ...sigKeys])
  }
  async jwksKey (kid) {
    const key = await this.getKey(kid)

    return key ? serialize([key]).keys[0] : null
  }
}
