const { generateKeyPair } = require('crypto')
const { promisify } = require('util')
const crypto = require('../lib/crypto')

describe('crypto', () => {
  let keys = []
  beforeAll(async () => {
    const options = {
      modulusLength: 1024,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    }
    keys.push(await promisify(generateKeyPair)('rsa', options))
  })
  describe('#generateDocumentKey', () => {
    it('returns a 32 byte (256 bit) key', async () => {
      const key = await crypto.generateDocumentKey()
      expect(key).toBeInstanceOf(Buffer)
      expect(key.length).toEqual(32)
    })
    it('returns base64', async () => {
      const key = await crypto.generateDocumentKey('base64')
      expect(typeof key).toEqual('string')
      const buf = Buffer.from(key, 'base64')
      expect(buf).toBeInstanceOf(Buffer)
      expect(buf.length).toEqual(32)
    })
  })
  describe('#encryptDocumentKey', () => {
    it('returns a buffer', async () => {
      const key = await crypto.generateDocumentKey()
      const encryptedKey = crypto.encryptDocumentKey(key, keys[0].publicKey)
      expect(encryptedKey).toBeInstanceOf(Buffer)
    })
    it('accepts a base64 key', async () => {
      const key = await crypto.generateDocumentKey('base64')
      const encryptedKey = crypto.encryptDocumentKey(key, keys[0].publicKey)
      expect(encryptedKey).toBeInstanceOf(Buffer)
    })
    it('returns base64', async () => {
      const key = await crypto.generateDocumentKey()
      const encryptedKey = crypto.encryptDocumentKey(key, keys[0].publicKey, 'base64')
      expect(typeof encryptedKey).toEqual('string')
      expect(Buffer.from(encryptedKey, 'base64')).toBeInstanceOf(Buffer)
    })
  })
  describe('#decryptDocumentKey', () => {
    it('decrypts an encrypted key', async () => {
      const key = await crypto.generateDocumentKey()
      const encryptedKey = crypto.encryptDocumentKey(key, keys[0].publicKey)
      const decryptedKey = crypto.decryptDocumentKey(encryptedKey, keys[0].privateKey)
      expect(decryptedKey).toEqual(key)
    })
    it('accepts base64', async () => {
      const key = await crypto.generateDocumentKey()
      const encryptedKey = crypto.encryptDocumentKey(key, keys[0].publicKey, 'base64')
      const decryptedKey = crypto.decryptDocumentKey(encryptedKey, keys[0].privateKey)
      expect(decryptedKey).toEqual(key)
    })
    it('returns base64', async () => {
      const key = await crypto.generateDocumentKey()
      const encryptedKey = crypto.encryptDocumentKey(key, keys[0].publicKey)
      const decryptedKey = crypto.decryptDocumentKey(encryptedKey, keys[0].privateKey, 'base64')
      expect(typeof decryptedKey).toEqual('string')
      expect(Buffer.from(decryptedKey, 'base64')).toBeInstanceOf(Buffer)
    })
  })
  describe('#encryptDocument', () => {
    it('returns a Buffer', async () => {
      const key = await crypto.generateDocumentKey()
      const cipher = await crypto.encryptDocument(key, 'foo: bar')
      expect(cipher).toBeInstanceOf(Buffer)
    })
    it('accepts base64', async () => {
      const key = await crypto.generateDocumentKey('base64')
      const cipher = await crypto.encryptDocument(key, 'foo: bar')
      expect(cipher).toBeInstanceOf(Buffer)
    })
    it('returns base64', async () => {
      const key = await crypto.generateDocumentKey()
      const cipher = await crypto.encryptDocument(key, 'foo: bar', 'base64')
      expect(typeof cipher).toEqual('string')
      expect(Buffer.from(cipher, 'base64')).toBeInstanceOf(Buffer)
    })
  })
  describe('#decryptDocument', () => {
    it('decrypts an encrypted document as buffer', async () => {
      const key = await crypto.generateDocumentKey()
      const cipher = await crypto.encryptDocument(key, 'foo: bar')
      expect(crypto.decryptDocument(key, cipher)).toEqual('foo: bar')
    })
    it('decrypts an encrypted document as base64', async () => {
      const key = await crypto.generateDocumentKey()
      const cipher = await crypto.encryptDocument(key, 'foo: bar', 'base64')
      expect(crypto.decryptDocument(key, cipher)).toEqual('foo: bar')
    })
  })
})
