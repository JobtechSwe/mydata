const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')
const { JWT } = require('@panva/jose')
const { createConnectionRequest } = require('./../lib/connection')
const { schemas } = require('@egendata/messaging')

describe('auth', () => {
  let clientKeys, config, payload
  beforeAll(async () => {
    clientKeys = await generateKeyPair()
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
      keyOptions: { modulusLength: 1024 }
    }
    payload = {
      type: 'CONNECTION_INIT',
      aud: 'http://localhost:51545',
      iss: 'mydata://account',
      sid: 'd1f99125-4537-40f1-b15c-fd5e0f067c61',
      iat: 1558945645,
      exp: 1558949245
    }
  })

  describe('#createConnectionRequest', () => {
    describe('without defaultPermissions', () => {
      let client
      beforeEach(() => {
        client = createClient(config)
      })
      it('creates a valid jwt', async () => {
        const connReq = await createConnectionRequest(client, payload)

        const result = JWT.decode(connReq)
        expect(result).not.toBe(null)
      })
      it('creates a valid message', async () => {
        const token = await createConnectionRequest(client, payload)

        const message = JWT.decode(token)
        await expect(schemas.CONNECTION_REQUEST.validate(message))
          .resolves.not.toThrow()
      })
    })
    describe('with defaultPermissions', () => {
      let client
      beforeEach(() => {
        const defaultPermissions = [
          { area: 'education', types: ['READ'], purpose: 'Because i wanna' },
          { area: 'experience', types: ['WRITE'], description: 'Many things about stuff' }
        ]
        client = createClient({
          ...config,
          defaultPermissions
        })
      })
      it('creates a valid jwt', async () => {
        const connReq = await createConnectionRequest(client, payload)

        const result = JWT.decode(connReq)
        expect(result).not.toBe(null)
      })
      it('creates a valid message', async () => {
        const token = await createConnectionRequest(client, payload)

        const message = JWT.decode(token)
        await expect(schemas.CONNECTION_REQUEST.validate(message))
          .resolves.not.toThrow()
      })
      it('Adds permissions if default permissions are configured', async () => {
        const connReq = await createConnectionRequest(client, payload)

        const result = JWT.decode(connReq)

        expect(result.permissions).toEqual(expect.any(Array))
      })
    })
  })
})
