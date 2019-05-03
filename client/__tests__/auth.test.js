const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')
const { decode } = require('jwt-lite')
const { createAuthenticationRequest } = require('./../lib/auth')
const { schemas } = require('./../lib/messaging')
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

      const decodedJwt = decode(authReq)
      expect(decodedJwt).not.toBe(null)
    })

    it('creates the correct jwt header', async () => {
      const id = 'some_id'
      const authReq = await createAuthenticationRequest(client, id)

      const { header } = decode(authReq, { complete: true })

      expect(header.kid).toEqual('http://localhost:4000/jwks/client_key')
      expect(schemas.header.validate(header).error).toEqual(null)
    })

    it('creates the correct jwt claimsSet', async () => {
      const id = v4()
      const authReq = await createAuthenticationRequest(client, id)

      const { claimsSet } = decode(authReq)

      expect(schemas.authenticationRequest.validate(claimsSet).error).toBe(null)

      expect(claimsSet.aud).toBe('mydata://auth')
      expect(claimsSet.iss).toBe('http://localhost:4000')
      expect(claimsSet.name).toBe('CV app')
      expect(claimsSet.description).toBe('A CV app with a description which is longer than 10 chars')
      expect(claimsSet.events).toBe('http://localhost:4000/events')
    })
  })
})
