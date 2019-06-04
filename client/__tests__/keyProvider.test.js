const { generateKeyPair } = require('./_helpers')
const crypto = require('../lib/crypto')
const KeyProvider = require('../lib/keyProvider')
jest.mock('../lib/crypto', () => ({
  generateJwkPair: jest.fn()
}))

const jsonToBase64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')
const base64ToJson = (str) => JSON.parse(Buffer.from(str, 'base64').toString('utf8'))

const jwkPair = {
  privateKey: {
    kty: 'RSA',
    kid: 'http://localhost:4000/jwks/enc_345678194103491235234235',
    use: 'enc',
    n: 't6Q8PWSi1dkJj9hTP8hNYFlvadM7DflW9mWepOJhJ66w7nyoK1gPNqFMSQRyO125Gp-TEkodhWr0iujjHVx7BcV0llS4w5ACGgPrcAd6ZcSR0-Iqom-QFcNP8Sjg086MwoqQU_LYywlAGZ21WSdS_PERyGFiNnj3QQlO8Yns5jCtLCRwLHL0Pb1fEv45AuRIuUfVcPySBWYnDyGxvjYGDSM-AqWS9zIQ2ZilgT-GqUmipg0XOC0Cc20rgLe2ymLHjpHciCKVAbY5-L32-lSeZO-Os6U15_aXrk9Gw8cPUaX1_I8sLGuSiVdt3C_Fn2PZ3Z8i744FPFGGcG1qs2Wz-Q',
    e: 'AQAB',
    d: 'GRtbIQmhOZtyszfgKdg4u_N-R_mZGU_9k7JQ_jn1DnfTuMdSNprTeaSTyWfSNkuaAwnOEbIQVy1IQbWVV25NY3ybc_IhUJtfri7bAXYEReWaCl3hdlPKXy9UvqPYGR0kIXTQRqns-dVJ7jahlI7LyckrpTmrM8dWBo4_PMaenNnPiQgO0xnuToxutRZJfJvG4Ox4ka3GORQd9CsCZ2vsUDmsXOfUENOyMqADC6p1M3h33tsurY15k9qMSpG9OX_IJAXmxzAh_tWiZOwk2K4yxH9tS3Lq1yX8C1EWmeRDkK2ahecG85-oLKQt5VEpWHKmjOi_gJSdSgqcN96X52esAQ',
    p: '2rnSOV4hKSN8sS4CgcQHFbs08XboFDqKum3sc4h3GRxrTmQdl1ZK9uw-PIHfQP0FkxXVrx-WE-ZEbrqivH_2iCLUS7wAl6XvARt1KkIaUxPPSYB9yk31s0Q8UK96E3_OrADAYtAJs-M3JxCLfNgqh56HDnETTQhH3rCT5T3yJws',
    q: '1u_RiFDP7LBYh3N4GXLT9OpSKYP0uQZyiaZwBtOCBNJgQxaj10RWjsZu0c6Iedis4S7B_coSKB0Kj9PaPaBzg-IySRvvcQuPamQu66riMhjVtG6TlV8CLCYKrYl52ziqK0E_ym2QnkwsUX7eYTB7LbAHRK9GqocDE5B0f808I4s',
    dp: 'KkMTWqBUefVwZ2_Dbj1pPQqyHSHjj90L5x_MOzqYAJMcLMZtbUtwKqvVDq3tbEo3ZIcohbDtt6SbfmWzggabpQxNxuBpoOOf_a_HgMXK_lhqigI4y_kqS1wY52IwjUn5rgRrJ-yYo1h41KR-vz2pYhEAeYrhttWtxVqLCRViD6c',
    dq: 'AvfS0-gRxvn0bwJoMSnFxYcK1WnuEjQFluMGfwGitQBWtfZ1Er7t1xDkbN9GQTB9yqpDoYaN06H7CFtrkxhJIBQaj6nkF5KKS3TQtQ5qCzkOkmxIe3KRbBymXxkb5qwUpX5ELD5xFc6FeiafWYY63TmmEAu_lRFCOJ3xDea-ots',
    qi: 'lSQi-w9CpyUReMErP1RsBLk7wNtOvs5EQpPqmuMvqW57NBUczScEoPwmUqqabu9V0-Py4dQ57_bapoKRu1R90bvuFnU63SHWEFglZQvJDMeAvmj4sm-Fp0oYu_neotgQ0hzbI5gry7ajdYy9-2lNx_76aBZoOUu9HCJ-UsfSOI8'
  },
  publicKey: {
    kty: 'RSA',
    kid: 'http://localhost:4000/jwks/enc_345678194103491235234235',
    use: 'enc',
    n: 't6Q8PWSi1dkJj9hTP8hNYFlvadM7DflW9mWepOJhJ66w7nyoK1gPNqFMSQRyO125Gp-TEkodhWr0iujjHVx7BcV0llS4w5ACGgPrcAd6ZcSR0-Iqom-QFcNP8Sjg086MwoqQU_LYywlAGZ21WSdS_PERyGFiNnj3QQlO8Yns5jCtLCRwLHL0Pb1fEv45AuRIuUfVcPySBWYnDyGxvjYGDSM-AqWS9zIQ2ZilgT-GqUmipg0XOC0Cc20rgLe2ymLHjpHciCKVAbY5-L32-lSeZO-Os6U15_aXrk9Gw8cPUaX1_I8sLGuSiVdt3C_Fn2PZ3Z8i744FPFGGcG1qs2Wz-Q',
    e: 'AQAB'
  }
}

describe('KeyProvider', () => {
  let keyProvider, clientKeys, keyValueStore, domain, jwksUrl
  beforeEach(async () => {
    clientKeys = await generateKeyPair()
    keyValueStore = {
      load: jest.fn().mockName('load').mockResolvedValue(''),
      save: jest.fn().mockName('save').mockResolvedValue(),
      remove: jest.fn().mockName('remove').mockResolvedValue()
    }
    const keyOptions = {
      modulusLength: 1024,
      tempKeyExpiry: 100
    }
    domain = 'http://localhost:4000'
    jwksUrl = `${domain}/jwks`
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
  describe('#generatePersistentKey', () => {
    it('saves generated keys', async () => {
      crypto.generateJwkPair.mockResolvedValue(jwkPair)

      await keyProvider.generatePersistentKey({ use: 'enc' })

      expect(keyValueStore.save).toHaveBeenCalled()
      const [, b64] = keyValueStore.save.mock.calls[0]
      expect(base64ToJson(b64)).toEqual(jwkPair)
    })
    it('returns the generated keys', async () => {
      crypto.generateJwkPair.mockResolvedValue(jwkPair)

      const result = await keyProvider.generatePersistentKey({ use: 'enc' })

      expect(result).toEqual(jwkPair)
    })
  })
  describe('#generateTemporaryKey', () => {
    it('saves generated keys', async () => {
      crypto.generateJwkPair.mockResolvedValue(jwkPair)

      await keyProvider.generateTemporaryKey({ use: 'enc' })

      expect(keyValueStore.save).toHaveBeenCalled()
      const [, b64] = keyValueStore.save.mock.calls[0]
      expect(base64ToJson(b64)).toEqual(jwkPair)
    })
    it('returns the generated keys', async () => {
      crypto.generateJwkPair.mockResolvedValue(jwkPair)

      const result = await keyProvider.generateTemporaryKey({ use: 'enc' })

      expect(result).toEqual(jwkPair)
    })

    it('sets ttl when it saves', async () => {
      crypto.generateJwkPair.mockResolvedValue(jwkPair)

      const result = await keyProvider.generateTemporaryKey({ use: 'enc' })

      expect(keyValueStore.save).toHaveBeenCalled()
      const [, , ttl] = keyValueStore.save.mock.calls[0]
      expect(result).toEqual(jwkPair)
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
      keyValueStore.load.mockResolvedValueOnce(jsonToBase64(jwkPair))

      const result = await keyProvider.jwksKey(jwkPair.publicKey.kid)
      expect(result).toEqual(jwkPair.publicKey)
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
        jsonToBase64(keys),
        undefined
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
  describe('#saveDocumentKeys', () => {
    it('calls save with a correct key', async () => {
      const consentId = 'consent-id'
      const domain = 'http://domain'
      const area = 'edumacation'
      const keys = { foo: 'hello', bar: 'world' }
      await keyProvider.saveDocumentKeys(consentId, domain, area, keys)
      expect(keyValueStore.save).toHaveBeenCalledWith(
        'documentKeys|>consent-id|http://domain|edumacation',
        jsonToBase64(keys),
        undefined
      )
    })
  })
  describe('#getDocumentKeys', () => {
    it('returns all document keys', async () => {
      const keys = { foo: 'hello', bar: 'world' }

      keyValueStore.load.mockResolvedValue(jsonToBase64(keys))

      const result = await keyProvider.getDocumentKeys('consent-id', 'domain', 'area')

      expect(keyValueStore.load).toHaveBeenCalledWith('documentKeys|>consent-id|domain|area')
      expect(result).toEqual(keys)
    })
  })
  describe.skip('#getDocumentEncryptionKey', () => {
    it('returns decrypted aes document key', async () => {
      const consentId = '19e82885-abfc-4e43-b35c-6d3807b5ebeb'
      const area = 'cv'
      const consentKeyPair = await generateKeyPair({ kid: `${jwksUrl}/enc_consent` })
      const accountKeyPair = await generateKeyPair({ kid: `mydata://${consentId}/account_key` })
      const aesDocumentKey = await crypto.generateDocumentKey()
      const documentKeys = {
        [consentKeyPair.kid]: crypto.encryptDocumentKey(aesDocumentKey, consentKeyPair.publicKey, 'base64'),
        [accountKeyPair.kid]: crypto.encryptDocumentKey(aesDocumentKey, accountKeyPair.publicKey, 'base64')
      }

      // Expected: First get documentKeys
      keyValueStore.load.mockResolvedValueOnce(jsonToBase64(documentKeys))
      // ...then load own key and decrypt
      keyValueStore.load.mockResolvedValueOnce(jsonToBase64(consentKeyPair))

      const result = await keyProvider.getDocumentEncryptionKey(consentId, domain, area)

      expect(keyValueStore.load).toHaveBeenNthCalledWith(1, `documentKeys|>${consentId}|${domain}|${area}`)
      expect(keyValueStore.load).toHaveBeenNthCalledWith(2, `key|>${consentKeyPair.kid}`)

      expect(result).toEqual(aesDocumentKey)
    })
  })
  describe.skip('#getDocumentDecryptionKey', () => {
    it('returns decrypted aes document key', async () => {
      const consentId = '19e82885-abfc-4e43-b35c-6d3807b5ebeb'
      const consentKeyPair = await generateKeyPair({ kid: `${jwksUrl}/enc_consent` })
      const accountKeyPair = await generateKeyPair({ kid: `mydata://${consentId}/account_key` })
      const aesDocumentKey = await crypto.generateDocumentKey()
      const documentKeys = {
        [consentKeyPair.kid]: crypto.encryptDocumentKey(aesDocumentKey, consentKeyPair.publicKey, 'base64'),
        [accountKeyPair.kid]: crypto.encryptDocumentKey(aesDocumentKey, accountKeyPair.publicKey, 'base64')
      }
      const b64DocumentKeys = jsonToBase64(documentKeys)

      // Expected: First get matching keyPair
      keyValueStore.load.mockResolvedValueOnce(jsonToBase64(consentKeyPair))

      const result = await keyProvider.getDocumentDecryptionKey(b64DocumentKeys, consentKeyPair.kid)
      expect(keyValueStore.load).toHaveBeenNthCalledWith(1, `key|>${consentKeyPair.kid}`)
      expect(result).toEqual(aesDocumentKey)
    })
    it('it does not return decrypted aes document key if none exists for current account', async () => {
      const consentId = '19e82885-abfc-4e43-b35c-6d3807b5ebeb'
      const consentKeyPair = await generateKeyPair({ kid: `${jwksUrl}/enc_consent` })
      const consentKeyPair2 = await generateKeyPair({ kid: `${jwksUrl}/enc_consent2` })
      const accountKeyPair = await generateKeyPair({ kid: `mydata://${consentId}/account_key` })
      const aesDocumentKey = await crypto.generateDocumentKey()
      const documentKeys = {
        [consentKeyPair.kid]: crypto.encryptDocumentKey(aesDocumentKey, consentKeyPair.publicKey, 'base64'),
        [accountKeyPair.kid]: crypto.encryptDocumentKey(aesDocumentKey, accountKeyPair.publicKey, 'base64')
      }
      const b64DocumentKeys = jsonToBase64(documentKeys)

      await expect(keyProvider.getDocumentDecryptionKey(b64DocumentKeys, consentKeyPair2.kid))
        .rejects.toThrow('No matching decryption key found')
    })
  })
  describe('#saveConsentKeyId', () => {
    it('calls save with a correct key', async () => {
      const consentId = 'consent-id'
      const kid = 'http://foo/jwks/enc_1234'
      await keyProvider.saveConsentKeyId(consentId, kid)
      expect(keyValueStore.save).toHaveBeenCalledWith(
        'consentKeyId|>consent-id',
        jsonToBase64(kid),
        undefined
      )
    })
  })
  describe('#getConsentKeyId', () => {
    it('returns the correct id', async () => {
      const kid = 'http://foo/jwks/enc_1234'

      keyValueStore.load.mockResolvedValue(jsonToBase64(kid))

      const result = await keyProvider.getConsentKeyId('consent-id')

      expect(keyValueStore.load).toHaveBeenCalledWith('consentKeyId|>consent-id')
      expect(result).toEqual(kid)
    })
  })
})
