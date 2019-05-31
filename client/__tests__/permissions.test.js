const { JWK } = require('@panva/jose')
const permissionsInit = require('../lib/permissions')

describe('permissions', () => {
  let clientId, keyProvider, permissions, key
  beforeEach(() => {
    clientId = 'https://mycv.work'
    key = JWK.generateSync('RSA', 1024, { use: 'enc' })
    keyProvider = {
      createEncryptionKey: jest.fn()
        .mockName('keyProvider.createEncryptionKey')
        .mockResolvedValue(key.toJWK(false))
    }
    const client = {
      clientId,
      keyProvider
    }
    permissions = permissionsInit(client)
  })
  describe('#fromConfig', () => {
    it('adds own domain, CONSENT and an id', async () => {
      const configPermissions = [
        { area: 'education', types: ['WRITE'], description: 'stuff' }
      ]
      const result = await permissions.fromConfig(configPermissions)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: clientId,
          area: 'education',
          type: 'WRITE',
          description: 'stuff',
          legalBasis: 'CONSENT'
        }
      ])
    })
    it('creates an encryption key for READ', async () => {
      const configPermissions = [
        { area: 'education', types: ['READ'], purpose: 'stuff' }
      ]
      const result = await permissions.fromConfig(configPermissions)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: clientId,
          area: 'education',
          type: 'READ',
          purpose: 'stuff',
          legalBasis: 'CONSENT',
          jwk: key.toJWK()
        }
      ])
    })
    it('turns each type into a row', async () => {
      const configPermissions = [
        {
          area: 'education',
          types: ['READ', 'WRITE'],
          purpose: 'stuff',
          description: 'stuff'
        }
      ]
      const result = await permissions.fromConfig(configPermissions)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: clientId,
          area: 'education',
          type: 'READ',
          purpose: 'stuff',
          legalBasis: 'CONSENT',
          jwk: key.toJWK()
        },
        {
          id: expect.any(String),
          domain: clientId,
          area: 'education',
          type: 'WRITE',
          description: 'stuff',
          legalBasis: 'CONSENT'
        }
      ])
    })
  })
})
