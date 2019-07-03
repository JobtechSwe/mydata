const { createPermissions } = require('../lib/permissions')

describe('permissions', () => {
  let clientId, shorthandPermissions, keyProvider
  beforeAll(() => {
    clientId = 'http://localhost:4000'
    shorthandPermissions = [
      { area: 'education', types: ['WRITE'], description: 'stuff' }
    ]
    keyProvider = {
      createEncryptionKey: jest.fn().mockName('keyProvider.createEncryptionKey'),
      generateTemporaryKey: jest.fn().mockName('keyProvider.generateTemporaryKey')
    }
  })
  describe('#createPermissions', () => {
    it('adds own domain, CONSENT and an id', async () => {
      const result = await createPermissions(shorthandPermissions, clientId, keyProvider)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: clientId,
          area: 'education',
          type: 'WRITE',
          description: 'stuff',
          lawfulBasis: 'CONSENT'
        }
      ])
    })
    it('creates an encryption key for READ', async () => {
      const jwk = { kid: 'foo', kty: 'RSA', use: 'enc', e: 'AQAB', n: 'a-large-number' }
      keyProvider.generateTemporaryKey.mockResolvedValue(jwk)
      shorthandPermissions = [ { area: 'education', types: ['READ'], purpose: 'stuff' } ]

      const result = await createPermissions(shorthandPermissions, clientId, keyProvider)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: clientId,
          area: 'education',
          type: 'READ',
          purpose: 'stuff',
          lawfulBasis: 'CONSENT',
          jwk
        }
      ])
    })
    it('turns each type into a row', async () => {
      const jwk = { kid: 'foo', kty: 'RSA', use: 'enc', e: 'AQAB', n: 'a-large-number' }
      keyProvider.generateTemporaryKey.mockResolvedValue(jwk)
      shorthandPermissions = [
        {
          area: 'education',
          types: ['READ', 'WRITE'],
          purpose: 'stuff',
          description: 'stuff'
        }
      ]
      const result = await createPermissions(shorthandPermissions, clientId, keyProvider)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: clientId,
          area: 'education',
          type: 'READ',
          purpose: 'stuff',
          lawfulBasis: 'CONSENT',
          jwk
        },
        {
          id: expect.any(String),
          domain: clientId,
          area: 'education',
          type: 'WRITE',
          description: 'stuff',
          lawfulBasis: 'CONSENT'
        }
      ])
    })
  })
})
