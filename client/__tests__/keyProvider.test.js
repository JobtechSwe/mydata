const { generateKeyPairSync } = require('crypto')
const KeyProvider = require(`${process.cwd()}/lib/keyProvider`)

describe('KeyProvider', () => {
  let keyProvider, clientKeys, keyStore, jwksUrl
  beforeEach(() => {
    clientKeys = generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    })
    keyStore = {
      getKey: jest.fn().mockName('getKey').mockResolvedValue([]),
      getKeys: jest.fn().mockName('getKeys').mockResolvedValue([]),
      saveKey: jest.fn().mockName('saveKey').mockResolvedValue({}),
      removeKey: jest.fn().mockName('removeKey').mockResolvedValue(),
      updateTTL: jest.fn().mockName('updateTTL').mockResolvedValue()
    }
    const keyOptions = {
      modulusLength: 1024,
      tempKeyExpiry: 100
    }
    jwksUrl = 'http://localhost:4000/jwks'
    keyProvider = new KeyProvider({ clientKeys, keyStore, keyOptions, jwksUrl })
  })
  describe('#getKeys', () => {
    it('calls getKeys with type', async () => {
      await keyProvider.getKeys('enc')
      expect(keyStore.getKeys).toHaveBeenCalledWith('enc')
    })
    it('returns all keys', async () => {
      keyStore.getKeys.mockResolvedValue([{ kid: 'abc' }])
      const result = await keyProvider.getKeys('enc')
      expect(result).toEqual([{ kid: 'abc' }])
    })
  })
  describe('#getKey', () => {
    it('calls getKey with kid', async () => {
      await keyProvider.getKey('http://localhost:4000/jwks/abc')
      expect(keyStore.getKey).toHaveBeenCalledWith('http://localhost:4000/jwks/abc')
    })
    it('calls getKey with other domain kid', async () => {
      await keyProvider.getKey('https://foobar/jwks/abc')
      expect(keyStore.getKey).toHaveBeenCalledWith('https://foobar/jwks/abc')
    })
    it('calls getKey with jwks + kid', async () => {
      await keyProvider.getKey('abc')
      expect(keyStore.getKey).toHaveBeenCalledWith('http://localhost:4000/jwks/abc')
    })
    it('returns one key', async () => {
      keyStore.getKey.mockResolvedValue({ kid: 'abc' })
      const result = await keyProvider.getKey('abc')
      expect(result).toEqual({ kid: 'abc' })
    })
  })
  describe('#generateKey', () => {
    it('saves generated keys', async () => {
      await keyProvider.generateKey({ use: 'enc' })
      expect(keyStore.saveKey).toHaveBeenCalledWith({
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
      expect(keyStore.saveKey).toHaveBeenCalledWith({
        publicKey: expect.any(String),
        privateKey: expect.any(String),
        use: 'enc',
        kid: expect.stringMatching(new RegExp(`^${jwksUrl}/enc_`))
      }, 100)
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
      expect(keyStore.removeKey).toHaveBeenCalledWith('abcd')
    })
  })
  describe('#jwksKeyList', () => {
    it('returns a jwks formatted list of all keys', async () => {
      const sig = await keyProvider.generateKey({ use: 'sig' })

      keyStore.getKeys.mockResolvedValueOnce([sig])

      const result = await keyProvider.jwksKeyList()
      expect(keyStore.getKeys).toHaveBeenLastCalledWith('sig')
      expect(result).toEqual({
        keys: [
          {
            kid: 'http://localhost:4000/jwks/client_key',
            use: 'sig',
            alg: 'RS256',
            kty: 'RSA',
            n: expect.any(String),
            e: 'AQAB'
          },
          {
            kid: expect.stringMatching(new RegExp(`^${jwksUrl}/sig_`)),
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

      keyStore.getKey.mockResolvedValueOnce(testKey)

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
})
