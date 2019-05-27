const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')
const { JWT } = require('@panva/jose')
const { createAuthenticationRequest } = require('./../lib/auth')
const { v4 } = require('uuid')

describe('auth', () => {
  let clientKeys, config, client
  beforeAll(async () => {
    clientKeys = await generateKeyPair()
    config = {
      displayName: 'CV app',
      description: 'A CV app with a description which is longer than 10 chars',
      clientId: 'http://localhost:4000',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      clientKeys: clientKeys,
      keyValueStore: createMemoryStore(),
      keyOptions: { modulusLength: 1024 }
    }
    client = createClient(config)
  })

  describe('#createAuthenticationRequest', () => {
    it('creates a valid jwt', async () => {
      const id = 'some_id'
      const authReq = await createAuthenticationRequest(client, id)

      const payload = JWT.decode(authReq)
      expect(payload).not.toBe(null)
    })

    it('creates header with correct kid', async () => {
      const id = 'some_id'
      const authReq = await createAuthenticationRequest(client, id)

      const { header } = JWT.decode(authReq, { complete: true })

      expect(header.kid).toEqual('http://localhost:4000/jwks/client_key')
    })

    it('creates the correct jwt claimsSet', async () => {
      const id = v4()
      const authReq = await createAuthenticationRequest(client, id)

      const payload = JWT.decode(authReq)

      expect(payload.aud).toBe('mydata://account')
      expect(payload.iss).toBe('http://localhost:4000')
    })
  })
})
