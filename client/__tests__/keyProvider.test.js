const { generateKeyPairSync } = require('crypto')
const { toPublicKey, importPEM } = require('../lib/crypto')
const KeyProvider = require('../lib/keyProvider')

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
const base64ToJson = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf8'))

describe('KeyProvider', () => {
  let keyOptions, keyProvider, pemKey, clientKey, keyValueStore, domain, jwksURI
  beforeEach(async () => {
    keyValueStore = {
      load: jest.fn().mockName('load').mockResolvedValue(''),
      save: jest.fn().mockName('save').mockResolvedValue(),
      remove: jest.fn().mockName('remove').mockResolvedValue()
    }
    keyOptions = {
      modulusLength: 1024,
      tempKeyExpiry: 100
    }
    domain = 'http://localhost:4000'
    jwksURI = `${domain}/jwks`
    pemKey = generateKeyPairSync('rsa', {
      modulusLength: keyOptions.modulusLength,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    }).privateKey
    clientKey = importPEM(pemKey, jwksURI, { use: 'sig', kid: `${jwksURI}/client_key` })
    keyProvider = new KeyProvider({ clientKey: pemKey, keyValueStore, keyOptions, jwksURI })
  })
  it('works with a PEM client key', () => {
    expect(keyProvider.clientKey).toEqual(clientKey)
  })
  it('works with a JWK client key', () => {
    keyProvider = new KeyProvider({ clientKey, keyValueStore, keyOptions, jwksURI })

    expect(keyProvider.clientKey).toEqual(clientKey)
  })
  describe('#getKey', () => {
    it('calls load with kid', async () => {
      await keyProvider.getKey('http://localhost:4000/jwks/abc')
      expect(keyValueStore.load).toHaveBeenCalledWith('key|>http://localhost:4000/jwks/abc')
    })
    it('calls load with other domain kid', async () => {
      await keyProvider.getKey('https://foobar/jwks/abc')
      expect(keyValueStore.load).toHaveBeenCalledWith('key|>https://foobar/jwks/abc')
    })
    it('calls load with jwks + kid', async () => {
      await keyProvider.getKey('abc')
      expect(keyValueStore.load).toHaveBeenCalledWith('key|>http://localhost:4000/jwks/abc')
    })
    it('returns one key', async () => {
      keyValueStore.load.mockResolvedValue(jsonToBase64({ kid: 'abc' }))
      const result = await keyProvider.getKey('abc')
      expect(result).toEqual({ kid: 'abc' })
    })
  })
  describe('#generatePersistentKey', () => {
    it('saves generated keys', async () => {
      const key = await keyProvider.generatePersistentKey({ use: 'enc' })

      expect(keyValueStore.save).toHaveBeenCalled()
      const [, b64] = keyValueStore.save.mock.calls[0]
      expect(base64ToJson(b64)).toEqual(key)
    })
  })
  describe('#generateTemporaryKey', () => {
    it('saves generated keys', async () => {
      const key = await keyProvider.generateTemporaryKey({ use: 'enc' })

      expect(keyValueStore.save).toHaveBeenCalled()
      const [, b64] = keyValueStore.save.mock.calls[0]
      expect(base64ToJson(b64)).toEqual(key)
    })
    it('sets ttl when it saves', async () => {
      await keyProvider.generateTemporaryKey({ use: 'enc' })

      expect(keyValueStore.save).toHaveBeenCalled()
      const [, , ttl] = keyValueStore.save.mock.calls[0]
      expect(ttl).toBe(keyProvider.options.tempKeyExpiry)
    })
  })
  describe('#removeKey', () => {
    it('removes the key with the specified kid', async () => {
      await keyProvider.removeKey('abcd')
      expect(keyValueStore.remove).toHaveBeenCalledWith('key|>abcd')
    })
  })
  describe('#jwksKeyList', () => {
    it('returns a jwks with client_key', async () => {
      const result = await keyProvider.jwksKeyList()
      expect(result).toEqual({
        keys: [ toPublicKey(clientKey) ]
      })
    })
  })
  describe('#jwksKey', () => {
    it('returns a single jwks formatted key', async () => {
      const key = await keyProvider.generatePersistentKey({ use: 'enc' })
      keyValueStore.load.mockResolvedValue(keyValueStore.save.mock.calls[0][1])

      const result = await keyProvider.jwksKey(key.kid)
      expect(result).toEqual(toPublicKey(key))
    })
  })
})
