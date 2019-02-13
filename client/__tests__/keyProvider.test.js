const { generateKeyPairSync } = require('crypto')
const KeyProvider = require('../lib/keyProvider')

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
const base64ToJson = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf8'))

describe('KeyProvider', () => {
  let keyProvider, clientKeys, keyValueStore, jwksUrl
  beforeEach(() => {
    clientKeys = generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    })
    keyValueStore = {
      load: jest.fn().mockName('load').mockResolvedValue(''),
      save: jest.fn().mockName('save').mockResolvedValue(),
      remove: jest.fn().mockName('remove').mockResolvedValue()
    }
    const keyOptions = {
      modulusLength: 1024,
      tempKeyExpiry: 100
    }
    jwksUrl = 'http://localhost:4000/jwks'
    keyProvider = new KeyProvider({ clientKeys, keyValueStore, keyOptions, jwksUrl })
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
  describe('#generateKey', () => {
    it('saves generated keys', async () => {
      await keyProvider.generateKey({ use: 'enc' })

      expect(keyValueStore.save).toHaveBeenCalledWith(expect.any(String), expect.any(String))

      const [kid, b64] = keyValueStore.save.mock.calls[0]
      expect(kid).toEqual(expect.stringMatching(new RegExp(`^key|>${jwksUrl}/enc_`)))
      expect(base64ToJson(b64)).toEqual({
        publicKey: expect.any(String),
        privateKey: expect.any(String),
        use: 'enc',
        kid: expect.stringMatching(new RegExp(`^${jwksUrl}/enc_`))
      })
    })
    it('returns the generated keys', async () => {
      const result = await keyProvider.generateKey({ use: 'enc' })
      expect(result).toEqual({
        publicKey: expect.any(String),
        privateKey: expect.any(String),
        use: 'enc',
        kid: expect.stringMatching(new RegExp(`^${jwksUrl}/enc_`))
      })
    })
    it('correctly names key as absolute url', async () => {
      const result = await keyProvider.generateKey({ use: 'enc' })
      expect(result.kid).toEqual(expect.stringMatching(new RegExp(`^${jwksUrl}/enc_`)))
    })
    it('correctly names key as absolute url with explicit kid', async () => {
      const result = await keyProvider.generateKey({ use: 'enc', kid: 'foo' })
      expect(result.kid).toEqual('http://localhost:4000/jwks/foo')
    })
    it('correctly names key as absolute url with explicit, absolute kid', async () => {
      const result = await keyProvider.generateKey({ use: 'enc', kid: 'http://localhost:4000/jwks/foo' })
      expect(result.kid).toEqual('http://localhost:4000/jwks/foo')
    })
  })
  describe('#generateTempKey', () => {
    it('saves generated keys', async () => {
      await keyProvider.generateTempKey({ use: 'enc' })

      expect(keyValueStore.save)
        .toHaveBeenCalledWith(expect.any(String), expect.any(String), 100)

      const [kid, b64, ttl] = keyValueStore.save.mock.calls[0]
      expect(kid).toEqual(expect.stringMatching(new RegExp(`key|>^${jwksUrl}/enc_`)))
      expect(base64ToJson(b64)).toEqual({
        publicKey: expect.any(String),
        privateKey: expect.any(String),
        use: 'enc',
        kid: expect.stringMatching(new RegExp(`^${jwksUrl}/enc_`))
      })
      expect(ttl).toEqual(100)
    })
    it('returns the generated keys', async () => {
      const result = await keyProvider.generateTempKey({ use: 'enc' })
      expect(result).toEqual({
        publicKey: expect.any(String),
        privateKey: expect.any(String),
        use: 'enc',
        kid: expect.any(String)
      })
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
        keys: [
          {
            kid: 'http://localhost:4000/jwks/client_key',
            use: 'sig',
            alg: 'RS256',
            kty: 'RSA',
            n: expect.any(String),
            e: 'AQAB'
          }
        ]
      })
    })
  })
  describe('#jwksKey', () => {
    it('returns a single jwks formatted key', async () => {
      const testKey = await keyProvider.generateKey({ use: 'enc', kid: 'test_key' })

      keyValueStore.load.mockResolvedValueOnce(jsonToBase64(testKey))

      const result = await keyProvider.jwksKey('test_key')
      expect(result).toEqual({
        kid: 'http://localhost:4000/jwks/test_key',
        use: 'enc',
        alg: 'RS256',
        kty: 'RSA',
        n: expect.any(String),
        e: 'AQAB'
      })
    })
  })
  describe('#saveAccessKeyIds', () => {
    it('calls save with a correct key', async () => {
      const consentId = 'consent-id'
      const domain = 'http://domain'
      const area = 'edumacation'
      const keys = [{ kid: '1' }, { kid: '2' }]
      await keyProvider.saveAccessKeyIds(consentId, domain, area, keys)
      expect(keyValueStore.save).toHaveBeenCalledWith(
        'accessKeyIds|>consent-id|http://domain|edumacation',
        jsonToBase64(keys)
      )
    })
  })
  describe('#getAccessKeys', () => {
    it('returns all access keys', async () => {
      const accountKey = {
        kid: 'account_key',
        publicKey: 'foo-bar'
      }
      const consentKey = {
        kid: 'consent_key',
        publicKey: 'herp',
        privateKey: 'derp'
      }
      const accessKeyIds = [accountKey.kid, consentKey.kid]

      keyValueStore.load.mockResolvedValueOnce(jsonToBase64(accessKeyIds))
      keyValueStore.load.mockResolvedValueOnce(jsonToBase64(accountKey))
      keyValueStore.load.mockResolvedValueOnce(jsonToBase64(consentKey))

      const keys = await keyProvider.getAccessKeys('consent-id', 'domain', 'area')

      expect(keyValueStore.load).toHaveBeenNthCalledWith(1, 'accessKeyIds|>consent-id|domain|area')
      expect(keyValueStore.load).toHaveBeenNthCalledWith(2, 'key|>account_key')
      expect(keyValueStore.load).toHaveBeenNthCalledWith(3, 'key|>consent_key')

      expect(keys).toEqual([accountKey, consentKey])
    })
  })
})
