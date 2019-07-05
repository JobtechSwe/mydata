const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { JWT } = require('@panva/jose')
const { connectionInitHandler, connectionEventHandler } = require('./../lib/connection')
const { sign } = require('../lib/jwt')
const { generateKey, toPublicKey } = require('../lib/crypto')
const { schemas } = require('@egendata/messaging')

jest.useFakeTimers()

describe('connection', () => {
  let clientKey, accountKey, permissionKey, config, client, handle, res, next
  beforeAll(async () => {
    accountKey = await generateKey('egendata://jwks', { use: 'sig' })
    permissionKey = await generateKey('http://localhost:4000/jwks', { use: 'enc' })
    clientKey = await generateKey('http://localhost:4000/jwks', { use: 'sig', kid: 'http://localhost:4000/jwks/client_key' })
  })
  beforeEach(() => {
    config = {
      displayName: 'CV app',
      description: 'A CV app with a description which is longer than 10 chars',
      iconURI: 'http://localhost:4000/ico.png',
      clientId: 'http://localhost:4000',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      clientKey: clientKey,
      keyValueStore: createMemoryStore(),
      keyOptions: { modulusLength: 1024 }
    }
    res = {
      sendStatus: jest.fn().mockName('res.sendStatus'),
      setHeader: jest.fn().mockName('res.setHeader'),
      write: jest.fn().mockName('res.write'),
      end: jest.fn().mockName('res.end')
    }
    next = jest.fn().mockName('next')
  })
  afterEach(() => {
    res.sendStatus.mockReset()
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
        client = createClient(config)
        handle = connectionInitHandler(client)
      })
      it('creates a valid jwt', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        const [ token ] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        expect(result).not.toBe(null)
      })
      it('creates a valid message', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        const [token] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        await expect(schemas.CONNECTION_REQUEST.validate(result))
          .resolves.not.toThrow()
      })
      it('sets the correct content-type', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

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
        client = createClient({
          ...config,
          defaultPermissions
        })
        handle = connectionInitHandler(client)
      })
      it('creates a valid jwt', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        const [token] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        expect(result).not.toBe(null)
      })
      it('creates a valid message', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        const [token] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        await expect(schemas.CONNECTION_REQUEST.validate(result))
          .resolves.not.toThrow()
      })
      it('adds permissions if default permissions are configured', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        const [token] = res.write.mock.calls[0]
        const result = JWT.decode(token)

        expect(result.permissions).toEqual(expect.any(Array))
      })
      it('sets the correct content-type', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/jwt')
      })
      it('ends the response', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

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
  describe('#connectionEventHandler', () => {
    let payload, connection
    beforeEach(async () => {
      connection = {
        type: 'CONNECTION',
        aud: 'http://localhost:51545',
        iss: 'mydata://account',
        sid: 'd1f99125-4537-40f1-b15c-fd5e0f067c61',
        sub: 'ab6aaf9e-de79-4285-b14b-38c27b5d27a4',
        iat: 1558945645,
        exp: 1558949245
      }
      const connectionToken = await sign(connection, accountKey, { jwk: toPublicKey(accountKey) })
      payload = {
        type: 'CONNECTION_EVENT',
        aud: 'http://localhost:51545',
        iss: 'mydata://account',
        sid: 'd1f99125-4537-40f1-b15c-fd5e0f067c61',
        iat: 1558945645,
        exp: 1558949245,
        payload: connectionToken
      }
    })
    describe('no permissions', () => {
      beforeEach(() => {
        client = createClient(config)
        handle = connectionEventHandler(client)
      })
      it('saves authentication to db', async () => {
        await handle({ payload }, res, next)

        const accessToken = await config.keyValueStore.load(`authentication|>${connection.sid}`)
        const { sub } = JWT.decode(accessToken)

        expect(sub).toEqual(connection.sub)
      })
      it('saves connection to db', async () => {
        await handle({ payload }, res, next)

        const connectionKey = `connection|>${connection.sub}`
        const conn = JSON.parse(await config.keyValueStore.load(connectionKey))

        expect(conn).toEqual({})
      })
      it('sends a 204 (No content) on success', async () => {
        await handle({ payload }, res, next)

        expect(res.sendStatus).toHaveBeenCalledWith(204)
      })
      it('passes any errors to next middleware', async () => {
        payload.payload = 'this is not a valid token'
        await handle({ payload }, res, next)

        expect(next).toHaveBeenCalledWith(expect.any(Error))
      })
    })
    describe('with approved permissions', () => {
      beforeEach(async () => {
        client = createClient(config)
        handle = connectionEventHandler(client)

        await client.keyProvider.save(`key|>${permissionKey.kid}`, permissionKey, 10)

        connection.permissions = {
          approved: [
            {
              id: '1fc622ab-ebdf-4f8d-a0dd-1afbfb492a5a',
              domain: 'https://mycv.work',
              area: 'education',
              type: 'READ',
              purpose: 'stuff',
              lawfulBasis: 'CONSENT',
              kid: permissionKey.kid
            },
            {
              id: '052bb693-de11-442c-a5b1-3fa9a36bc851',
              domain: 'https://mycv.work',
              area: 'education',
              type: 'WRITE',
              description: 'some data yo!',
              lawfulBasis: 'CONSENT',
              jwks: {
                keys: [
                  toPublicKey(accountKey),
                  toPublicKey(permissionKey)
                ]
              }
            }
          ]
        }
        const connectionToken = await sign(connection, accountKey, { jwk: toPublicKey(accountKey) })
        payload.payload = connectionToken
      })
      afterEach(async () => {
        await client.keyProvider.removeKey(permissionKey.kid)
      })
      it('saves authentication to db', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        const accessToken = await config.keyValueStore.load(`authentication|>${connection.sid}`)
        const { sub } = JWT.decode(accessToken)

        expect(sub).toEqual(connection.sub)
      })
      it('saves connection to db', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        const connectionKey = `connection|>${connection.sub}`
        const conn = JSON.parse(await config.keyValueStore.load(connectionKey))

        expect(conn).toEqual({
          permissions: connection.permissions
        })
      })
      it('saves approved read-keys permanently', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        jest.runAllTimers()

        const key = await client.keyProvider.getKey(permissionKey.kid)
        expect(key).toEqual(permissionKey)
      })
      it('saves write keys', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        jest.runAllTimers()

        const { domain, area } = connection.permissions.approved[1]
        await expect(client.keyProvider.getWriteKeys(domain, area))
          .resolves.toEqual({
            keys: [
              toPublicKey(accountKey),
              toPublicKey(permissionKey)
            ]
          })
      })
      it('sends a 204 (No content) on success', async () => {
        await handle({ payload }, res, next)
        expect(next).not.toHaveBeenCalled()

        expect(res.sendStatus).toHaveBeenCalledWith(204)
      })
      it('passes any errors to next middleware', async () => {
        payload.payload = 'this is not a valid token'
        await handle({ payload }, res, next)

        expect(next).toHaveBeenCalledWith(expect.any(Error))
      })
    })
  })
})
