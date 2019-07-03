const { createPermissions } = require('../lib/permissions')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')

describe('permissions', () => {
  let config, keyProvider
  beforeAll(async () => {
    const clientKeys = await generateKeyPair()
    config = {
      displayName: 'CV app',
      description: 'A CV app with a description which is longer than 10 chars',
      iconURI: 'http://localhost:4000/ico.png',
      clientId: 'http://localhost:4000',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      clientKeys: clientKeys,
      keyValueStore: createMemoryStore(),
      keyOptions: { modulusLength: 1024 },
      defaultPermissions: [
        { area: 'education', types: ['WRITE'], description: 'stuff' }
      ]
    }
  })
  describe('#createPermissions', () => {
    it('adds own domain, CONSENT and an id', async () => {
      keyProvider = { createEncryptionKey: jest.fn() }

      const result = await createPermissions(config, keyProvider)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: config.clientId,
          area: 'education',
          type: 'WRITE',
          description: 'stuff',
          lawfulBasis: 'CONSENT'
        }
      ])
    })
    it('creates an encryption key for READ', async () => {
      const jwk = { kid: 'foo', kty: 'RSA', use: 'enc', e: 'AQAB', n: 'a-large-number' }
      keyProvider = {
        generateTemporaryKey: jest.fn().mockResolvedValue({ publicKey: jwk })
      }

      const configWithReadPermissions = {
        ...config,
        defaultPermissions: [ { area: 'education', types: ['READ'], purpose: 'stuff' } ]
      }

      const result = await createPermissions(configWithReadPermissions, keyProvider)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: config.clientId,
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

      keyProvider = {
        generateTemporaryKey: jest.fn().mockResolvedValue({ publicKey: jwk })
      }

      const configPermissions = [
        {
          area: 'education',
          types: ['READ', 'WRITE'],
          purpose: 'stuff',
          description: 'stuff'
        }
      ]
      const result = await createPermissions({ ...config, defaultPermissions: configPermissions }, keyProvider)

      expect(result).toEqual([
        {
          id: expect.any(String),
          domain: config.clientId,
          area: 'education',
          type: 'READ',
          purpose: 'stuff',
          lawfulBasis: 'CONSENT',
          jwk
        },
        {
          id: expect.any(String),
          domain: config.clientId,
          area: 'education',
          type: 'WRITE',
          description: 'stuff',
          lawfulBasis: 'CONSENT'
        }
      ])
    })
  })
})
