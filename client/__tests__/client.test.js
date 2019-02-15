const createClient = require('../lib/client')
const MemoryKeyValueStore = require('../lib/memoryKeyValueStore')
const axios = require('axios')
const { generateKeyPair, verifySignature } = require('./_helpers')
jest.mock('axios')

describe('client', () => {
  let config, clientKeys

  beforeEach(async () => {
    clientKeys = await generateKeyPair()
    config = {
      displayName: 'CV app',
      description: 'A CV app with a description which is at least 10 chars',
      clientId: 'https://mycv.work',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      clientKeys: clientKeys,
      keyValueStore: new MemoryKeyValueStore(),
      keyOptions: { modulusLength: 1024 }
    }
  })

  afterEach(() => {
    axios.post.mockClear()
  })

  describe('createClient', () => {
    let client
    beforeEach((done) => {
      axios.post.mockResolvedValueOnce({})
      client = createClient(config)
      setTimeout(() => done(), 10)
    })

    it('does _not_ call the operator to register until told so', () => {
      expect(axios.post).not.toHaveBeenCalled()
    })

    it('sets sensible defaults', () => {
      const {
        displayName,
        description,
        clientId,
        operator,
        clientKeys,
        keyValueStore
      } = config
      client = createClient({
        displayName,
        description,
        clientId,
        operator,
        clientKeys,
        keyValueStore
      })
      expect(client.config.jwksPath).toEqual('/jwks')
      expect(client.config.eventsPath).toEqual('/events')
      expect(client.config.alg).toEqual('RSA-SHA512')
    })

    it('throws if clientId is missing', () => {
      config.clientId = undefined
      expect(() => createClient(config)).toThrow()
    })

    it('throws if displayName is missing', () => {
      config.displayName = undefined
      expect(() => createClient(config)).toThrow()
    })

    it('throws if operator is missing', () => {
      config.operator = undefined
      expect(() => createClient(config)).toThrow()
    })

    it('throws if operator is not a valid uri', () => {
      config.operator = 'fobara87as9duadh'
      expect(() => createClient(config)).toThrow()
    })

    it('throws if keyValueStore is missing', () => {
      config.keyValueStore = undefined
      expect(() => createClient(config)).toThrow()
    })

    it('throws if clientKeys is missing', () => {
      config.clientKeys = undefined
      expect(() => createClient(config)).toThrow()
    })

    describe('#connect()', () => {
      it('calls the operator to register the client service', async () => {
        await client.connect()
        expect(axios.post).toHaveBeenCalledWith('https://smoothoperator.work/api/clients', expect.any(Object))
      })

      it('sends correct parameters', async () => {
        await client.connect()
        expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
          data: {
            displayName: 'CV app',
            description: 'A CV app with a description which is at least 10 chars',
            clientId: 'https://mycv.work',
            jwksUrl: 'https://mycv.work/jwks',
            eventsUrl: 'https://mycv.work/events'
          },
          signature: {
            data: expect.any(String),
            alg: 'RSA-SHA512',
            kid: 'https://mycv.work/jwks/client_key'
          }
        })
      })

      it('calls events.emit with payload', async () => {
        client.events.emit = jest.fn()
        await client.connect()
        expect(client.events.emit).toHaveBeenCalledTimes(1)
      })

      it('signs the payload', async () => {
        await client.connect()
        const [, { data, signature }] = axios.post.mock.calls[0]
        expect(verifySignature({ data, signature }, clientKeys.publicKey)).toEqual(true)
      })
    })
  })
})
