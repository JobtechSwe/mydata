const app = require('../../../lib/app')
const clientService = require('../../../lib/services/clients')
const redis = require('../../../lib/adapters/redis')
const { createApi, generateKeys, sign } = require('../../helpers')
const { getKey } = require('jwks-manager')
jest.mock('../../../lib/services/clients')
jest.mock('../../../lib/adapters/redis')
jest.mock('jwks-manager', () => ({ getKey: jest.fn() }))

describe('routes /api/consents', () => {
  let api, cv, clientKeys, encryptionKeys
  beforeAll(async () => {
    clientKeys = await generateKeys('sig', 'http://cv.work/jwks/client_key')
    encryptionKeys = await generateKeys('enc', 'http://cv.work/jwks/encryption')
  })
  beforeEach(() => {
    getKey.mockResolvedValue({ rsaPublicKey: clientKeys.publicKey })
    api = createApi(app)
    cv = {
      clientId: 'http://cv.work',
      clientKey: clientKeys.publicKey,
      jwksUrl: '/jwks',
      eventsUrl: '/events',
      displayName: 'My CV',
      description: 'An app for your CV online'
    }
    clientService.get.mockResolvedValue(cv)
    redis.set.mockResolvedValue('OK')
  })
  const payload = (data) => ({
    data,
    signature: {
      alg: 'RSA-SHA512',
      kid: clientKeys.kid,
      data: sign('RSA-SHA512', data, clientKeys.privateKey)
    }
  })

  describe('POST: /requests', () => {
    let data
    beforeEach(() => {
      data = {
        clientId: 'http://cv.work',
        kid: encryptionKeys.kid,
        expiry: 123143234,
        scope: [
          { domain: 'cv.work', area: 'experience', purpose: 'För att kunna bygga ditt CV', description: 'this data contains....', permissions: [ 'WRITE' ], lawfulBasis: 'CONSENT', required: true },
          { domain: 'cv.work', area: 'education', purpose: 'För att kunna bygga ditt CV', description: 'this data contains....', permissions: [ 'WRITE' ], lawfulBasis: 'CONSENT', required: true },
          { domain: 'cv.work', area: 'languages', purpose: 'För att kunna bygga ditt CV', description: 'this data contains....', permissions: [ 'WRITE' ], lawfulBasis: 'CONSENT', required: true }
        ]
      }
    })
    it('throws a 400 if clientId is missing', async () => {
      data.clientId = undefined
      const response = await api.post('/api/consents/requests', payload(data))
      expect(response.status).toEqual(400)
    })
    it('throws a 400 if no encryption kid is specified', async () => {
      data.kid = undefined
      const response = await api.post('/api/consents/requests', payload(data))
      expect(response.status).toEqual(400)
    })
    it('throws a 400 if scope is missing', async () => {
      data.scope = undefined
      const response = await api.post('/api/consents/requests', payload(data))
      expect(response.status).toEqual(400)
    })
    it('throws a 400 if scope is empty', async () => {
      data.scope = []
      const response = await api.post('/api/consents/requests', payload(data))
      expect(response.status).toEqual(400)
    })
    it('returns 200 if succesful', async () => {
      const reqPayload = payload(data)
      const result = await api.post('/api/consents/requests', reqPayload)
      expect(result.body.message).toBeUndefined()
      expect(result.status).toEqual(201)
    })
    it('returns id, url and expires if succesful', async () => {
      const reqPayload = payload(data)
      const result = await api.post('/api/consents/requests', reqPayload)
      expect(result.body).toEqual({
        data: {
          id: expect.any(String),
          url: expect.stringMatching(/^mydata:\/\/register\//),
          expires: expect.any(String)
        }
      })
    })
    it('saves consent request to redis if it validates', async () => {
      const reqPayload = payload(data)
      await api.post('/api/consents/requests', reqPayload)

      const url = expect.stringMatching(/^consentRequest:*/)
      const savedRequest = JSON.stringify({
        data,
        signature: {
          ...reqPayload.signature,
          client: cv,
          key: clientKeys.publicKey
        }
      })

      expect(redis.set).toHaveBeenCalledWith(url, savedRequest, 'NX', 'EX', 3600)
    })
  })

  describe('GET: /requests/:id', () => {
    let consentRequest, signature
    beforeEach(() => {
      consentRequest = {
        clientId: 'http://cv.work',
        kid: 'encryption-key-id',
        expiry: 123143234,
        scope: [
          { domain: 'cv.work', area: 'experience', purpose: 'För att kunna bygga ditt CV', description: 'this data contains....', permissions: ['write'], lawfulBasis: 'CONSENT', required: true },
          { domain: 'cv.work', area: 'education', purpose: 'För att kunna bygga ditt CV', description: 'this data contains....', permissions: ['write'], lawfulBasis: 'CONSENT', required: true },
          { domain: 'cv.work', area: 'languages', purpose: 'För att kunna bygga ditt CV', description: 'this data contains....', permissions: ['write'], lawfulBasis: 'CONSENT', required: true }
        ]
      }
      signature = {
        client: {
          clientId: 'http://cv.work',
          jwksUrl: '/jwks',
          eventsUrl: '/events',
          displayName: 'CV',
          description: 'This is Sparta',
          clientKey: 'RSA etc'
        },
        data: 'some-signature',
        key: 'RSA etc',
        kid: 'client_key'
      }

      redis.get.mockResolvedValue('')
    })

    it('gets request from redis', async () => {
      const id = '1234'

      await api.get(`/api/consents/requests/${id}`)

      expect(redis.get).toHaveBeenCalledWith(`consentRequest:${id}`)
    })

    it('should return 200 with data', async () => {
      const id = '1234'
      redis.get.mockResolvedValue(JSON.stringify({ data: consentRequest, signature }))

      const response = await api.get(`/api/consents/requests/${id}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        data: consentRequest,
        signature: {
          kid: 'client_key',
          data: 'some-signature'
        },
        client: {
          jwksUrl: '/jwks',
          displayName: 'CV',
          description: 'This is Sparta'
        }
      })
    })

    it('should return 404 without data', async () => {
      redis.get.mockResolvedValue(null)

      const id = '1234'
      const response = await api.get(`/api/consents/requests/${id}`)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({})
    })
  })
})
