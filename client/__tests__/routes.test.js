const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('crypto')
const { promisify } = require('util')
const request = require('supertest')
const express = require('express')
jest.mock('axios')

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
  describe.skip('/jwks', () => {
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
            n: expect.any(String),
            ext: true,
            key_ops: ['verify']
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
          n: expect.any(String),
          ext: true,
          key_ops: ['verify']
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

  describe.skip('/events', () => {
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
    it('throws if content type is not application/jwt', async () => {
      // TODO:
      const response = await request(app).post('/events').send(body)
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
})
