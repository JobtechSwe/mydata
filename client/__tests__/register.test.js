const { createClientRegistration } = require('../lib/register')
const { generateKeyPair } = require('./_helpers')
const { createMemoryStore } = require('../lib/memoryStore')
const createClient = require('../lib/client')
const { JWT } = require('@panva/jose')
const { validateHeader, validateMessage } = require('@mydata/messaging')

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

    expect(JWT.decode(clientRegistration)).not.toBe(null)
  })

  it('creates the correct jwt header', async () => {
    const clientRegistration = await createClientRegistration(client)

    const { header } = JWT.decode(clientRegistration, { complete: true })
    await validateHeader(header)

    expect(header.kid).toEqual('http://localhost:4000/jwks/client_key')
  })

  it('creates the correct jwt payload', async () => {
    const clientRegistration = await createClientRegistration(client)

    const payload = JWT.decode(clientRegistration)

    await validateMessage(payload)

    expect(payload.aud).toBe('https://smoothoperator.work')
    expect(payload.iss).toBe('http://localhost:4000')
  })
})
