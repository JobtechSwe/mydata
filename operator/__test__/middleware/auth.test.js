const express = require('express')
const clientsService = require('../../lib/services/clients')
const { signed } = require('../../lib/middleware/auth')
const jwksProvider = require('jwks-provider')
const { createApi, generateKeys, sign } = require('../helpers')

jest.mock('../../lib/services/clients')

describe('/middleware/auth', () => {
  let clientKey
  beforeAll(async () => {
    clientKey = await generateKeys('sig', 'client_key')
  })
  let app, route, api, cv
  beforeEach(() => {
    cv = {
      clientId: 'http://mydata.work',
      clientKey: clientKey.publicKey,
      displayName: 'My CV',
      description: 'An app',
      jwksUrl: 'http://mydata.work/jwks',
      eventsUrl: 'http://mydata.work/events'
    }
    clientsService.get.mockResolvedValue(cv)

    route = jest.fn((req, res) => res.send({})).mockName('route')
    app = express()
    app.use(express.json())
    app.post('/test', signed(), route)
    app.post('/accounts', signed({ accountKey: true }), route)
    app.post('/clients', signed({ clientKey: true }), route)

    app.use((err, req, res, next) => res.status(err.status).send(err))

    api = createApi(app)
  })
  describe('#signed', () => {
    describe('with clientId and kid (general)', () => {
      let payload, keys
      beforeEach(() => {
        keys = {}
        keys[clientKey.kid] = clientKey
        payload = {
          data: {
            clientId: 'http://mydata.work',
            foo: 'bar'
          },
          signature: {
            alg: 'RSA-SHA256',
            data: '',
            kid: 'http://mydata.work/jwks/client_key'
          }
        }
        payload.signature.data = sign(payload.signature.alg, payload.data, clientKey.privateKey)
      })
      it('gives a validation error if data and signature are not present', async () => {
        const res = await api.post('/test', {})
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if no data is present', async () => {
        payload.data = undefined
        const res = await api.post('/test', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if no signature is present', async () => {
        payload.signature = undefined
        const res = await api.post('/test', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if data.clientId is missing', async () => {
        payload.data.clientId = undefined
        const res = await api.post('/test', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if signature.kid is missing', async () => {
        payload.signature.kid = undefined
        const res = await api.post('/test', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if signature.data is missing', async () => {
        payload.signature.data = undefined
        const res = await api.post('/test', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 403 if algorithm is not allowed', async () => {
        payload.signature.alg = 'md5'
        const res = await api.post('/test', payload)
        expect(route).not.toBeCalled()
        expect(res.body.message).toEqual('Invalid algorithm')
        expect(res.status).toEqual(403)
      })
      describe('safe', () => {
        beforeEach(() => {
          process.env.NODE_ENV = 'production'
        })
        afterEach(() => {
          process.env.NODE_ENV = 'test'
        })
        it('throws 403 and does not call route if in production and clientId is using http', async () => {
          clientsService.get.mockResolvedValue()
          const res = await api.post('/test', payload)
          expect(route).not.toBeCalled()
          expect(res.status).toEqual(403)
          expect(res.body.message).toEqual('Unsafe (http) is not allowed')
        })
      })

      describe('verifying through calling jwks endpoint', () => {
        let server, signingKey
        beforeEach(async () => {
          signingKey = await generateKeys('sig', 'some_other_signing_key')
          keys[signingKey.kid] = signingKey

          const app = express()
          app.use(express.json())
          app.get('/jwks', (req, res) => {
            const keys = jwksProvider.serialize([clientKey, signingKey])
            res.send(keys)
          })
          app.get('/jwks/:kid', (req, res) => {
            const key = keys[req.params.kid]
            const serialized = jwksProvider.serialize([key]).keys[0]
            res.send(serialized)
          })
          return new Promise((resolve) => {
            server = app.listen(() => {
              payload.data.clientId = `http://localhost:${server.address().port}`
              payload.data.jwksUrl = `${payload.data.clientId}/jwks`
              payload.signature.kid = `${payload.data.jwksUrl}/some_other_signing_key`
              payload.signature.data = sign(payload.signature.alg, payload.data, signingKey.privateKey)

              clientKey.kid = payload.data.jwksUrl + '/' + clientKey.kid
              signingKey.kid = payload.data.jwksUrl + '/' + signingKey.kid
              resolve()
            })
          })
        })
        afterEach(async () => {
          await server.close()
        })
        it('throws a 401 if specified key cannot be retrieved', async () => {
          payload.signature.kid = 'http://somethingelse.bork/jwks/derp'
          const res = await api.post('/test', payload)
          expect(res.status).toEqual(401)
          expect(res.body.message).toEqual('Could not retrieve key [http://somethingelse.bork/jwks/derp]')
        })
        it('throws 403 if signature cannot be validated', async () => {
          payload.signature.data = 'bork'
          const res = await api.post('/test', payload)
          expect(route).not.toBeCalled()
          expect(res.body.message).toEqual('Invalid signature')
          expect(res.status).toEqual(403)
        })
        it('throws 403 if signature key is wrong', async () => {
          payload.signature.data = sign(payload.signature.alg, payload.data, clientKey.privateKey)
          const res = await api.post('/test', payload)
          expect(route).not.toBeCalled()
          expect(res.body.message).toEqual('Invalid signature')
          expect(res.status).toEqual(403)
        })
        it('calls route with data part of payload if signature is verified', async () => {
          await api.post('/test', payload)
          expect(route).toHaveBeenCalled()
          const [[req]] = route.mock.calls
          expect(req.body).toEqual(payload.data)
        })
        it('sets req.signature.client', async () => {
          const res = await api.post('/test', payload)
          expect(res.status).toEqual(200)
          expect(route).toHaveBeenCalled()
          const [[req]] = route.mock.calls
          expect(req.signature.client).toEqual(cv)
        })
      })
    })

    describe('with accountKey (create account)', () => {
      let accountKey, payload
      beforeAll(async () => {
        accountKey = await generateKeys('sig', 'account_key')
      })
      beforeEach(async () => {
        payload = {
          data: {
            accountKey: Buffer.from(accountKey.publicKey).toString('base64'),
            foo: 'bar'
          },
          signature: {
            alg: 'RSA-SHA512',
            kid: 'account_key',
            data: ''
          }
        }
        payload.signature.data = sign(payload.signature.alg, payload.data, accountKey.privateKey)
      })
      it('gives a validation error if data and signature are not present', async () => {
        const res = await api.post('/accounts', {})
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if no data is present', async () => {
        payload.data = undefined
        const res = await api.post('/accounts', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if no signature is present', async () => {
        payload.signature = undefined
        const res = await api.post('/accounts', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if data.accountKey is missing', async () => {
        payload.data.accountKey = undefined
        const res = await api.post('/accounts', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 400 if signature.data is missing', async () => {
        payload.signature.data = undefined
        const res = await api.post('/accounts', payload)
        expect(route).not.toBeCalled()
        expect(res.status).toEqual(400)
        expect(res.body.name).toEqual('ValidationError')
      })
      it('throws 403 if signature cannot be validated', async () => {
        payload.signature.data = 'bork'
        const res = await api.post('/accounts', payload)
        expect(route).not.toBeCalled()
        expect(res.body.details).toBeUndefined()
        expect(res.body.message).toEqual('Invalid signature')
        expect(res.status).toEqual(403)
      })
      it('calls route with data part of payload if public key signature is verified', async () => {
        await api.post('/accounts', payload)
        expect(route).toHaveBeenCalled()
        const [[req]] = route.mock.calls
        expect(req.body).toEqual(payload.data)
      })
      it('calls route with signature if verified', async () => {
        await api.post('/accounts', payload)
        expect(route).toHaveBeenCalled()
        const [[req]] = route.mock.calls
        expect(req.signature).toEqual({
          client: undefined,
          alg: 'RSA-SHA512',
          data: payload.signature.data,
          key: accountKey.publicKey,
          kid: 'account_key'
        })
      })
    })
  })
})
