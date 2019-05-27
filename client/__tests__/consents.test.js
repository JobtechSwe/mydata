const createClient = require('../lib/client')
const { createMemoryStore } = require('../lib/memoryStore')
const { generateKeyPair } = require('./_helpers')
const { v4 } = require('uuid')
const axios = require('axios')
const { sign } = require('jsonwebtoken')
jest.mock('axios')

const base64 = (str) => Buffer.from(str, 'utf8').toString('base64')

describe.skip('consents', () => {
  let clientKeys, client, dummyRequest, dummyResponse

  beforeAll(async () => {
    clientKeys = await generateKeyPair()
  })
  beforeEach(() => {
    const config = {
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
  afterEach(() => {
    axios.post.mockClear()
  })

  describe('#request', () => {
    beforeEach(() => {
      dummyRequest = {
        scope:
          [{
            domain: 'http://localhost:4000',
            area: 'cv',
            description:
              'A list of your work experiences, educations, language proficiencies and so on that you have entered in the service.',
            permissions: ['WRITE'],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT'
          }],
        expiry: 1549704812
      }

      dummyResponse = {
        data: {
          data: {
            code: '4445',
            expires: 345678
          }
        }
      }

      axios.post.mockResolvedValue(dummyResponse)
    })
    describe('validation', () => {
      it('throws if scope is missing', () => {
        dummyRequest.scope = undefined
        return expect(client.consents.request(dummyRequest))
          .rejects.toThrow(/\["scope" is required\]/)
      })
      it('throws if expiry is missing', () => {
        dummyRequest.expiry = undefined
        return expect(client.consents.request(dummyRequest))
          .rejects.toThrow(/\["expiry" is required\]/)
      })
      it('fixes casing of permissions', () => {
        dummyRequest.scope[0].permissions = ['write']
        return expect(client.consents.request(dummyRequest))
          .resolves.not.toThrow()
      })
      it('fixes casing of lawfulBasis', () => {
        dummyRequest.scope[0].lawfulBasis = 'legalObligation'
        return expect(client.consents.request(dummyRequest))
          .resolves.not.toThrow()
      })
    })
    it('calls operator with correct url', async () => {
      await client.consents.request(dummyRequest)
      expect(axios.post).toHaveBeenLastCalledWith(`https://smoothoperator.work/api/consents/requests`, expect.any(Object))
    })
    it('calls operator with correct payload', async () => {
      await client.consents.request(dummyRequest)
      const expectedPayload = {
        data: {
          ...dummyRequest,
          clientId: 'http://localhost:4000',
          kid: expect.stringMatching(new RegExp('^http://localhost:4000/jwks/enc_'))
        },
        signature: {
          alg: 'RSA-SHA256',
          kid: 'http://localhost:4000/jwks/client_key',
          data: expect.any(String)
        }
      }
      expect(axios.post).toHaveBeenLastCalledWith(expect.any(String), expectedPayload)
    })
    it('unwraps response and returns code', async () => {
      const { code } = await client.consents.request(dummyRequest)

      expect(code).toBe('4445')
    })
  })
  describe('#onApprove', () => { // TODO: Rename to onApproved ?
    let consent, accountKeys, consentKeys, readKeysGig
    beforeEach(async () => {
      const consentId = v4()
      consentKeys = await generateKeyPair({
        use: 'enc',
        kid: 'http://localhost:4000/jwks/enc_foo'
      })
      accountKeys = await generateKeyPair({
        kid: `mydata://${consentId}/account_key`
      })
      readKeysGig = await generateKeyPair({
        kid: 'http://gig.work/jwks/read'
      })

      await client.keyProvider.saveKey(consentKeys)

      consent = {
        consentId,
        consentRequestId: v4(),
        accessToken: sign({ data: { consentId } }, 'secret'),
        scope: [
          {
            domain: 'http://localhost:4000',
            area: 'education',
            description:
              'A list of your educations that you have entered in the service.',
            permissions: ['READ', 'WRITE'],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT',
            accessKeyIds: [
              accountKeys.kid,
              consentKeys.kid
            ]
          },
          {
            domain: 'http://localhost:4000',
            area: 'experience',
            description:
              'A list of your experiences that you have entered in the service.',
            permissions: ['READ'],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT',
            accessKeyIds: [
              accountKeys.kid,
              consentKeys.kid,
              readKeysGig.kid
            ]
          }
        ],
        keys: {
          [accountKeys.kid]: base64(accountKeys.publicKey),
          [consentKeys.kid]: base64(consentKeys.publicKey),
          [readKeysGig.kid]: base64(readKeysGig.publicKey)
        }
      }
    })
    it('saves the accountKey', async () => {
      await client.consents.onApprove(consent)
      const key = await client.keyProvider.getKey(accountKeys.kid)
      expect(key).toBeTruthy()
      expect(key.publicKey).toEqual(accountKeys.publicKey)
    })
    it('saves the gigKey', async () => {
      await client.consents.onApprove(consent)
      const key = await client.keyProvider.getKey(readKeysGig.kid)
      expect(key).toBeTruthy()
      expect(key.publicKey).toEqual(readKeysGig.publicKey)
    })
    it('saves own key', async () => {
      await client.consents.onApprove(consent)
      const key = await client.keyProvider.getKey(consentKeys.kid)
      expect(key).toBeTruthy()
      expect(key.publicKey).toEqual(consentKeys.publicKey)
      expect(key.privateKey).toEqual(consentKeys.privateKey)
    })
    it('removes expiry for own key', async () => {
      jest.useFakeTimers()
      await client.consents.onApprove(consent)
      jest.advanceTimersByTime(999999999)
      const key = await client.keyProvider.getKey(consentKeys.kid)
      expect(key).toBeTruthy()
      expect(key.publicKey).toEqual(consentKeys.publicKey)
      expect(key.privateKey).toEqual(consentKeys.privateKey)
      jest.clearAllTimers()
    })
    it('saves the accessKeyIds', async () => {
      let accessKeyIds, accessKeys
      await client.consents.onApprove(consent)

      const domain = 'http://localhost:4000'

      accessKeyIds = await client.keyProvider.getAccessKeyIds(consent.consentId, domain, 'education')
      expect(accessKeyIds).toEqual([accountKeys.kid, consentKeys.kid])

      accessKeys = await client.keyProvider.getAccessKeys(consent.consentId, domain, 'education')
      expect(accessKeys).toEqual([
        {
          kid: accountKeys.kid,
          use: 'enc',
          publicKey: accountKeys.publicKey
        },
        consentKeys
      ])

      accessKeyIds = await client.keyProvider.getAccessKeyIds(consent.consentId, domain, 'experience')
      expect(accessKeyIds).toEqual([accountKeys.kid, consentKeys.kid, readKeysGig.kid])

      accessKeys = await client.keyProvider.getAccessKeys(consent.consentId, domain, 'experience')
      expect(accessKeys).toEqual([
        {
          kid: accountKeys.kid,
          use: 'enc',
          publicKey: accountKeys.publicKey
        },
        consentKeys,
        {
          kid: readKeysGig.kid,
          use: 'enc',
          publicKey: readKeysGig.publicKey
        }
      ])
    })
  })
})
