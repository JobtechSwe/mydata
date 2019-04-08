const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')

describe('login', () => {
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

  describe('#getUrl', () => {
    it('properly creates a login url', () => {
      const sessionId = 'some_id'
      const expected = 'mydata://login/eyJzZXNzaW9uSWQiOiJzb21lX2lkIiwiY2xpZW50SWQiOiJodHRwOi8vbG9jYWxob3N0OjQwMDAifQ'
      return expect(client.login.getUrl(sessionId)).toEqual(expected)
    })
  })
})
