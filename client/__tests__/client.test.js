const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const axios = require('axios')
const { generateKey } = require('../lib/crypto')
const { JWT } = require('@panva/jose')
jest.mock('axios')

describe('client', () => {
  let config, clientKey

  beforeEach(async () => {
    const clientId = 'https://mycv.work'
    const jwksURI = `${clientId}/jwks`
    clientKey = await generateKey(jwksURI, { use: 'sig', kid: `${jwksURI}/client_key` })
    config = {
      displayName: 'CV app',
      description: 'A CV app with a description which is at least 10 chars',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      iconURI: 'https://mycv.work/favicon.png',
      clientKey: clientKey,
      keyValueStore: createMemoryStore(),
      keyOptions: { modulusLength: 1024 },
      clientId
    }
  })
  afterEach(() => {
    axios.post.mockClear()
  })
  describe('createClient', () => {
    let client
    beforeEach((done) => {
      axios.post.mockResolvedValue({ status: 200 })
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
        clientKey,
        keyValueStore,
        iconURI
      } = config
      client = createClient({
        displayName,
        description,
        clientId,
        operator,
        clientKey,
        keyValueStore,
        iconURI
      })
      expect(client.config.jwksPath).toEqual('/jwks')
      expect(client.config.eventsPath).toEqual('/events')
      expect(client.config.alg).toEqual('RS256')
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
        expect(axios.post).toHaveBeenCalledWith('https://smoothoperator.work/api', expect.any(String), { headers: { 'content-type': 'application/jwt' } })
      })

      it('calls events.emit with payload', async () => {
        const listener = jest.fn()
        client.events.on('CONNECTED', listener)
        await client.connect()
        expect(listener).toHaveBeenCalledTimes(1)
      })

      it('signs the payload', async () => {
        await client.connect()
        const jwt = axios.post.mock.calls[0][1]
        const { signature } = JWT.decode(jwt, { complete: true })

        expect(signature).toEqual(expect.any(String))
        expect(signature).not.toBe('')
      })
    })
  })
})
