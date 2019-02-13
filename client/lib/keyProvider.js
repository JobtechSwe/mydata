const { generateKeyPair, createHash } = require('crypto')
const { promisify } = require('util')
const { serialize } = require('jwks-provider')
const Joi = require('joi')

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

module.exports = class KeyProvider {
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

    this.getKey = this.getKey.bind(this)
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
    const key = await this.keyValueStore.load(kid)
    return key ? base64ToJson(key) : key
  }
  async generateKey ({ use, kid }) {
    const key = await generateKeyPairObject(this.jwksUrl, { use, kid }, this.options)
    await this.keyValueStore.save(key.kid, jsonToBase64(key))
    return key
  }
  async generateTempKey ({ use, kid }) {
    const key = await generateKeyPairObject(this.jwksUrl, { use, kid }, this.options)
    await this.keyValueStore.save(key.kid, jsonToBase64(key), this.options.tempKeyExpiry)
    return key
  }
  async saveKey (key) {
    this.keyValueStore.save(key.kid, jsonToBase64(key))
  }
  async removeKey (kid) {
    await this.keyValueStore.remove(kid)
  }
  async jwksKeyList () {
    return serialize([this.clientKeys])
  }
  async jwksKey (kid) {
    const key = await this.getKey(kid)

    return key ? serialize([key]).keys[0] : null
  }
}
