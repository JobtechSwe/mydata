const { createServiceRegistration } = require('../lib/serviceRegistration')
const { generateKeyPair } = require('./_helpers')
const { createMemoryStore } = require('../lib/memoryStore')
const createClient = require('../lib/client')
const { JWT } = require('@panva/jose')

describe('#createServiceRegistration', () => {
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
  it('creates a valid jwt', async () => {
    const clientRegistration = await createServiceRegistration(client)

    expect(JWT.decode(clientRegistration)).not.toBe(null)
  })
  it('creates a jwt', async () => {
    const clientRegistration = await createServiceRegistration(client)

    const { header, payload } = JWT.decode(clientRegistration, { complete: true })

    expect(header.kid).toEqual('http://localhost:4000/jwks/client_key')
    expect(payload).toEqual(expect.any(Object))
  })
})
