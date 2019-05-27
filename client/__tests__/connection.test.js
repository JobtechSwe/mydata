const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')
const { JWT } = require('@panva/jose')
const { createConnectionRequest } = require('./../lib/connection')

describe('auth', () => {
  let clientKeys, config, client
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
    client = createClient(config)
  })

  describe('#createConnectionRequest', () => {
    it('creates a valid jwt', async () => {
      const payload = {
        type: 'CONNECTION_INIT',
        aud: 'http://localhost:51545',
        iss: 'mydata://account',
        sid: 'd1f99125-4537-40f1-b15c-fd5e0f067c61',
        iat: 1558945645,
        exp: 1558949245
      }

      const connReq = await createConnectionRequest(client, payload)

      const result = JWT.decode(connReq)
      expect(result).not.toBe(null)
    })
  })
})
