const { createClientRegistration } = require('../lib/register')
const { generateKeyPair } = require('./_helpers')
const { createMemoryStore } = require('../lib/memoryStore')
const createClient = require('../lib/client')
const { decode } = require('jwt-lite')
const { schemas } = require('../lib/messaging')

describe('#createClientRegistration', () => {
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
    const clientRegistration = await createClientRegistration(client)

    const decodedJwt = decode(clientRegistration)
    expect(decodedJwt).not.toBe(null)
  })

  it('creates the correct jwt header', async () => {
    const clientRegistration = await createClientRegistration(client)

    const { header } = decode(clientRegistration, { complete: true })

    expect(header.kid).toEqual('http://localhost:4000/jwks/client_key')
    expect(schemas.header.validate(header).error).toEqual(null)
  })

  it('creates the correct jwt claimsSet', async () => {
    const clientRegistration = await createClientRegistration(client)

    const { claimsSet } = decode(clientRegistration)

    expect(schemas.clientRegistration.validate(claimsSet).error).toBe(null)

    expect(claimsSet.aud).toBe('https://smoothoperator.work')
    expect(claimsSet.iss).toBe('http://localhost:4000')
  })
})
