const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('crypto')
const { promisify } = require('util')
const request = require('supertest')
const express = require('express')
jest.mock('axios')

function base64 (txt) {
  return Buffer.from(txt, 'utf8').toString('base64')
}

describe('routes', () => {
  let clientKeys, client, app, keyValueStore

  beforeAll(async () => {
    clientKeys = await promisify(generateKeyPair)('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    })
  })
  beforeEach(() => {
    keyValueStore = createMemoryStore()
    jest.spyOn(keyValueStore, 'load')
    jest.spyOn(keyValueStore, 'save')

    const config = {
      displayName: 'CV app',
      description: 'A CV app with a description that is at least 10 chars',
      clientId: 'https://cv.work',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      clientKeys: clientKeys,
      keyValueStore,
      keyOptions: { modulusLength: 1024 }
    }
    client = createClient(config)
    app = express()
    app.use(express.json())
    app.use(client.routes)
    app.use(({ status, message }, req, res, next) => {
      res.status(status).send({ message })
    })
  })
  describe('/jwks', () => {
    it('contains the client_key', async () => {
      const res = await request(app).get('/jwks')

      expect(res.body).toEqual({
        keys: [
          {
            kid: 'https://cv.work/jwks/client_key',
            alg: 'RS256',
            kty: 'RSA',
            use: 'sig',
            e: 'AQAB',
            n: expect.any(String)
          }
        ]
      })
    })
    describe('/:kid', () => {
      it('returns client_key', async () => {
        const res = await request(app).get('/jwks/client_key')

        expect(res.body).toEqual({
          kid: 'https://cv.work/jwks/client_key',
          alg: 'RS256',
          kty: 'RSA',
          use: 'sig',
          e: 'AQAB',
          n: expect.any(String)
        })
      })
      it('returns enc key', async () => {
        await client.keyProvider.generateKey({ use: 'enc', kid: 'test_key' })

        const res = await request(app).get('/jwks/test_key')

        expect(res.body).toEqual({
          kid: 'https://cv.work/jwks/test_key',
          alg: 'RS256',
          kty: 'RSA',
          use: 'enc',
          e: 'AQAB',
          n: expect.any(String)
        })
      })
    })
  })
  describe('/events', () => {
    let body, consentKeys
    beforeAll(async () => {
      const { publicKey, privateKey } = await promisify(generateKeyPair)('rsa', {
        modulusLength: 1024,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
      })
      consentKeys = {
        publicKey,
        privateKey,
        use: 'enc',
        kid: 'https://cv.work/jwks/enc_20190128154632'
      }
    })
    beforeEach(async () => {
      client.keyProvider.saveKey(consentKeys)
      body = {
        type: 'CONSENT_APPROVED',
        payload: {
          consentId: '566c9327-b1cb-4e5b-8633-3b1f1fbbe9ad',
          consentRequestId: 'a75db04b-ed3a-47e4-bf6a-fa0eb1e61ed1',
          accessToken: '7yasd87ya9da98sdu98adsu',
          scope: [{
            domain: 'https://cv.work',
            area: 'education',
            description: 'Stuff',
            permissions: ['READ', 'WRITE'],
            purpose: 'because',
            lawfulBasis: 'CONSENT',
            accessKeyIds: [
              'mydata://566c9327-b1cb-4e5b-8633-3b1f1fbbe9ad',
              'https://cv.work/jwks/enc_20190128154632'
            ]
          }],
          keys: {
            'mydata://566c9327-b1cb-4e5b-8633-3b1f1fbbe9ad': base64('foo'),
            'https://cv.work/jwks/enc_20190128154632': base64('bar')
          }
        }
      }
    })
    it('throws if body does not contain `type`', async () => {
      body.type = undefined
      const response = await request(app).post('/events').send(body)

      expect(response.status).toEqual(400)
      expect(response.body.message).toMatch('["type" is required]')
    })
    it('throws if body does not contain `payload`', async () => {
      body.payload = undefined
      const response = await request(app).post('/events').send(body)

      expect(response.status).toEqual(400)
      expect(response.body.message).toMatch('["payload" is required]')
    })
    it('throws if event type is unknown', async () => {
      body.type = 'SNEL_HEST'
      const response = await request(app).post('/events').send(body)

      expect(response.status).toEqual(400)
      expect(response.body.message).toMatch('["type" must be one of [CONSENT_APPROVED')
    })
    describe('[CONSENT_APPROVED]', () => {
      let listener
      beforeEach(() => {
        listener = jest.fn()
        client.events.on('CONSENT_APPROVED', listener)
      })
      describe('validation', () => {
        it('throws if `accessToken` is missing from payload', async () => {
          body.payload.accessToken = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["accessToken" is required]')
        })
        it('throws if `consentId` is missing from payload', async () => {
          body.payload.consentId = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["consentId" is required]')
        })
        it('throws if `consentRequestId` is missing from payload', async () => {
          body.payload.consentRequestId = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["consentRequestId" is required]')
        })
        it('throws if `scope` is missing from payload', async () => {
          body.payload.scope = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["scope" is required]')
        })
        it('throws if `scope` is empty', async () => {
          body.payload.scope = []
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["scope" must contain at least 1 items]')
        })
        it('throws if `scope` does not contain `domain`', async () => {
          body.payload.scope[0].domain = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["domain" is required]')
        })
        it('throws if `scope` does not contain `area`', async () => {
          body.payload.scope[0].area = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["area" is required]')
        })
        it('throws if `scope` does not contain `description`', async () => {
          body.payload.scope[0].description = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["description" is required]')
        })
        it('throws if `scope` does not contain `permissions`', async () => {
          body.payload.scope[0].permissions = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["permissions" is required]')
        })
        it('throws if `scope` `permissions` is empty', async () => {
          body.payload.scope[0].permissions = []
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["permissions" must contain at least 1 items]')
        })
        it('throws if `scope` `permissions` contains invalid values', async () => {
          body.payload.scope[0].permissions.push('derp')
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('must be one of [READ, WRITE]')
        })
        it('throws if `scope` does not contain `purpose`', async () => {
          body.payload.scope[0].purpose = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["purpose" is required]')
        })
        it('throws if `scope` does not contain `lawfulBasis`', async () => {
          body.payload.scope[0].lawfulBasis = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["lawfulBasis" is required]')
        })
        it('throws if `scope` `lawfulBasis` has invalid value', async () => {
          body.payload.scope[0].lawfulBasis = 'fish'
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["lawfulBasis" must be one of [CONSENT, CONTRACT, LEGAL_OBLIGATION, VITAL_INTERESTS, PUBLIC_TASK, LEGITIMATE_INTERESTS]]')
        })
        it('throws if `scope` does not contain `accessKeyIds`', async () => {
          body.payload.scope[0].accessKeyIds = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["accessKeyIds" is required]')
        })
        it('throws if `scope` `accessKeyIds` is empty', async () => {
          body.payload.scope[0].accessKeyIds = []
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["accessKeyIds" must contain at least 2 items]')
        })
        it('throws if `keys` is missing from payload', async () => {
          body.payload.keys = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["keys" is required]')
        })
      })
      it('saves keys', async () => {
        await request(app).post('/events').send(body)
        expect(keyValueStore.load)
          .toHaveBeenCalledWith('key|>https://cv.work/jwks/enc_20190128154632')
        expect(keyValueStore.save)
          .toHaveBeenCalledWith('key|>https://cv.work/jwks/enc_20190128154632', expect.any(String), undefined)
        expect(keyValueStore.save)
          .toHaveBeenCalledWith('consentKeyId|>566c9327-b1cb-4e5b-8633-3b1f1fbbe9ad', base64('"https://cv.work/jwks/enc_20190128154632"'), undefined)
        expect(keyValueStore.save)
          .toHaveBeenCalledWith('key|>mydata://566c9327-b1cb-4e5b-8633-3b1f1fbbe9ad', expect.any(String), undefined)
        expect(keyValueStore.save)
          .toHaveBeenCalledWith('accessKeyIds|>566c9327-b1cb-4e5b-8633-3b1f1fbbe9ad|https://cv.work|education', expect.any(String), undefined)
      })
      it('triggers an event', async () => {
        await request(app).post('/events').send(body)

        expect(listener).toHaveBeenCalledWith(body.payload)
      })
    })

    describe('[LOGIN_APPROVED]', () => {
      let listener
      beforeEach(() => {
        listener = jest.fn()
        client.events.on('LOGIN_APPROVED', listener)
        body = {
          type: 'LOGIN_APPROVED',
          payload: {
            accessToken: '7yasd87ya9da98sdu98adsu',
            clientId: 'http://someservice.tld',
            consentId: '566c9327-b1cb-4e5b-8633-3b1f1fbbe9ad',
            sessionId: 'fd9je9yu4e94h4hjhhh',
            timestamp: '2019-03-26T14:00:47.214Z'
          }
        }
      })
      describe('validation', () => {
        it('throws if `accessToken` is missing from payload', async () => {
          body.payload.accessToken = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["accessToken" is required]')
        })
        it('throws if `clientId` is missing from payload', async () => {
          body.payload.clientId = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["clientId" is required]')
        })
        it('throws if `consentId` is missing from payload', async () => {
          body.payload.consentId = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["consentId" is required]')
        })
        it('throws if `sessionId` is missing from payload', async () => {
          body.payload.sessionId = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["sessionId" is required]')
        })
        it('throws if `timestamp` is missing from payload', async () => {
          body.payload.timestamp = undefined
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["timestamp" is required]')
        })
        it('throws if `timestamp` is in the wrong format', async () => {
          body.payload.timestamp = 1553608878758
          const response = await request(app).post('/events').send(body)

          expect(response.status).toEqual(400)
          expect(response.body.message).toMatch('["timestamp" must be a valid ISO 8601 date]')
        })
        it('triggers an event', async () => {
          const response = await request(app).post('/events').send(body)
          expect(response.body.message).toBeUndefined()
          expect(response.status).toEqual(200)

          expect(listener).toHaveBeenCalledWith(body.payload)
        })
      })
    })
  })
})
