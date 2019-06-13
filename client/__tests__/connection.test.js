const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')
const { JWT } = require('@panva/jose')
const { connectionInitHandler } = require('./../lib/connection')
const { schemas } = require('@egendata/messaging')

describe('connection', () => {
  let clientKeys, config, handle, res, next
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
  })
  beforeEach(() => {
    res = {
      setHeader: jest.fn().mockName('res.setHeader'),
      write: jest.fn().mockName('res.write'),
      end: jest.fn().mockName('res.end')
    }
    next = jest.fn().mockName('next')
  })
  afterEach(() => {
    res.setHeader.mockReset()
    res.write.mockReset()
    res.end.mockReset()
    next.mockReset()
  })

  describe('#connectionInitHandler', () => {
    let payload
    beforeEach(() => {
      payload = {
        type: 'CONNECTION_INIT',
        aud: 'http://localhost:51545',
        iss: 'mydata://account',
        sid: 'd1f99125-4537-40f1-b15c-fd5e0f067c61',
        iat: 1558945645,
        exp: 1558949245
      }
    })
    describe('without defaultPermissions', () => {
      beforeEach(() => {
        const client = createClient(config)
        handle = connectionInitHandler(client)
      })
      it('creates a valid jwt', async () => {
        await handle({ payload }, res, next)
        const [ token ] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        expect(result).not.toBe(null)
      })
      it('creates a valid message', async () => {
        await handle({ payload }, res, next)
        const [token] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        await expect(schemas.CONNECTION_REQUEST.validate(result))
          .resolves.not.toThrow()
      })
      it('sets the correct content-type', async () => {
        await handle({ payload }, res, next)

        expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/jwt')
      })
      it('ends the response', async () => {
        await handle({ payload }, res, next)

        expect(res.end).toHaveBeenCalled()
      })
      it('passes any errors to next middleware', async () => {
        const error = new Error('b0rk')
        res.setHeader.mockImplementation(() => { throw error })
        await handle({ payload }, res, next)

        expect(next).toHaveBeenCalledWith(error)
      })
    })
    describe('with defaultPermissions', () => {
      beforeEach(() => {
        const defaultPermissions = [
          { area: 'education', types: ['READ'], purpose: 'Because i wanna' },
          { area: 'experience', types: ['WRITE'], description: 'Many things about stuff' }
        ]
        const client = createClient({
          ...config,
          defaultPermissions
        })
        handle = connectionInitHandler(client)
      })
      it('creates a valid jwt', async () => {
        await handle({ payload }, res, next)
        const [token] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        expect(result).not.toBe(null)
      })
      it('creates a valid message', async () => {
        await handle({ payload }, res, next)
        const [token] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        await expect(schemas.CONNECTION_REQUEST.validate(result))
          .resolves.not.toThrow()
      })
      it('adds permissions if default permissions are configured', async () => {
        await handle({ payload }, res, next)
        const [token] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        expect(result.permissions).toEqual(expect.any(Array))
      })
      it('sets the correct content-type', async () => {
        await handle({ payload }, res, next)

        expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/jwt')
      })
      it('ends the response', async () => {
        await handle({ payload }, res, next)

        expect(res.end).toHaveBeenCalled()
      })
      it('passes any errors to next middleware', async () => {
        const error = new Error('b0rk')
        res.setHeader.mockImplementation(() => { throw error })
        await handle({ payload }, res, next)

        expect(next).toHaveBeenCalledWith(error)
      })
    })
  })
  describe.skip('#connectionEventHandler', () => {
    let loginEvent, login
    let res, next
    beforeEach(() => {
      loginEvent = {

      }
      login = {

      }
    })
  })
})
