const createClient = require('../lib/client')
const MemoryKeyStore = require('../lib/memoryKeyStore')
const { generateKeyPair } = require('crypto')
const { promisify } = require('util')
const { v4 } = require('uuid')
const axios = require('axios')
const { sign } = require('jsonwebtoken')
jest.mock('axios')

async function generateKeys () {
  return promisify(generateKeyPair)('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
  })
}

const base64 = (str) => Buffer.from(str, 'utf8').toString('base64')

describe('consents', () => {
  let clientKeys, client, keyStore, dummyRequest, dummyResponse

  beforeAll(async () => {
    clientKeys = await generateKeys()
  })
  beforeEach(() => {
    keyStore = new MemoryKeyStore()
    const config = {
      displayName: 'CV app',
      description: 'A CV app with a description which is longer than 10 chars',
      clientId: 'http://localhost:4000',
      operator: 'https://smoothoperator.work',
      jwksPath: '/jwks',
      eventsPath: '/events',
      clientKeys: clientKeys,
      keyStore,
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
          alg: 'RSA-SHA512',
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
      accountKeys = await generateKeys()
      consentKeys = await generateKeys()
      readKeysGig = await generateKeys()
      const consentId = v4()

      accountKeys.kid = `${consentId}/account_key`
      consentKeys.kid = 'http://localhost:4000/jwks/education'
      readKeysGig.kid = 'http://gig.work/jwks/read'

      keyStore.saveKey({
        ...consentKeys,
        use: 'enc'
      }, 60000)

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
            readKeys: [
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
            readKeys: [
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
      const key = await keyStore.getKey(accountKeys.kid)
      expect(key.publicKey).toEqual(accountKeys.publicKey)
    })
    it('saves the gigKey', async () => {
      await client.consents.onApprove(consent)
      const key = await keyStore.getKey(readKeysGig.kid)
      expect(key.publicKey).toEqual(readKeysGig.publicKey)
    })
    it('updates ttl for own key', async () => {
      expect(keyStore.getTTL(consentKeys.kid)).toBeGreaterThan(0)

      await client.consents.onApprove(consent)
      const keys = (await keyStore.getKeys('enc'))
        .filter(k => k.kid === consentKeys.kid)
      expect(keyStore.getTTL(consentKeys.kid)).toBeUndefined()
      expect(keys).toHaveLength(1)
    })
  })
})
