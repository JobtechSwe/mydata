const crypto = require('./crypto')
const cache = {}

const serializeDocumentKeys = (keys) => Buffer.from(JSON.stringify(keys), 'utf8').toString('base64')
const deserializeDocumentKeys = (base64) => JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
const encryptDocumentKeys = async (aesKey, encryptionKeys) => {
  return encryptionKeys
    .map(([readKeyId, readKeyVal]) => ({
      [readKeyId]: crypto.encryptDocumentKey(aesKey, Buffer.from(readKeyVal, 'base64').toString('utf8'))
    }))
    .reduce((obj, key) => Object.assign(obj, key))
}

class Document {
  constructor (scope, keys, client) {
    this.domain = scope.domain
    this.area = scope.area
    this.readKeys = scope.readKeys.reduce((keyMap, keyId) => ({
      ...keyMap,
      [keyId]: keys[keyId]
    }))
    this.client = client
    this.rxJwks = new RegExp(`^${client.config.clientId}${client.config.jwksUrl}/(.+)`)
  }

  async encrypt (data) {
    if (!this.aesKey) {
      this.aesKey = await crypto.generateDocumentKey()
    }
    if (!this.documentKeys) {
      this.documentKeys = encryptDocumentKeys(this.aesKey, this.readKeys)
    }
    const documentData = { data }
    const encryptedDocument = await crypto.encryptDocument(this.aesKey, JSON.stringify(documentData), 'base64')
    return `${encryptedDocument}\n${serializeDocumentKeys(this.documentKeys)}`
  }

  async decrypt (text) {
    const [encryptedDocument, documentKeysBase64] = text.split('\n')
    this.documentKeys = deserializeDocumentKeys(documentKeysBase64)

    const myDocumentKeyId = Object.keys(this.documentKeys).find(keyId => this.rxJwks.test(keyId))
    const encryptedDocumentKey = this.documentKeys[myDocumentKeyId]
    const decryptionKey = await this.client.keyProvider.load({ kid: myDocumentKeyId })

    this.aesKey = crypto.decryptDocumentKey(encryptedDocumentKey, decryptionKey.privateKey)
    const decrypted = crypto.decryptDocument(this.aesKey, encryptedDocument)
    return JSON.parse(decrypted)
  }
}

function get (consent, scope, client) {
  const key = `${consent.consentId}|${scope.domain}|${scope.area}`
  if (!cache[key]) {
    cache[key] = new Document(scope, consent.keys)
  }
  return cache[key]
}

module.exports = {
  get
}
