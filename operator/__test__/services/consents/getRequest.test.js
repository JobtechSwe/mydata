const { getRequest } = require('../../../lib/services/consents')
const redis = require('../../../lib/adapters/redis')
const postgres = require('../../../lib/adapters/postgres')
jest.mock('../../../lib/adapters/redis')
jest.mock('../../../lib/adapters/postgres')

describe('services/consents #getRequest', () => {
  let consentRequestId, consentRequest
  beforeEach(async () => {
    consentRequestId = '3f7901b7-9889-4233-9451-41206bf35b9e'
    consentRequest = {
      data: {
        scope: [
          {
            domain: 'https://cv.work',
            area: 'baseData',
            description: 'Personlig information (namn och liknande).',
            permissions: [
              'READ',
              'WRITE'
            ],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT'
          },
          {
            domain: 'https://cv.work',
            area: 'experience',
            description: 'A list of your work experiences.',
            permissions: [
              'READ',
              'WRITE'
            ],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT'
          },
          {
            domain: 'https://cv.work',
            area: 'education',
            description: 'A list of your educations.',
            permissions: [
              'READ',
              'WRITE'
            ],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT'
          },
          {
            domain: 'https://cv.work',
            area: 'languages',
            description: 'A list of your language proficiencies.',
            permissions: [
              'READ',
              'WRITE'
            ],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT'
          },
          {
            domain: 'https://nationalregistry.gov',
            area: 'firstName',
            description: 'Your first name.',
            permissions: [
              'READ'
            ],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT'
          },
          {
            domain: 'https://nationalregistry.gov',
            area: 'lastName',
            description: 'Your last name.',
            permissions: [
              'READ'
            ],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT'
          },
          {
            domain: 'https://nationalregistry.gov',
            area: 'city',
            description: 'Your city of residence.',
            permissions: [
              'READ'
            ],
            purpose: 'In order to create a CV using our website.',
            lawfulBasis: 'CONSENT'
          }
        ],
        expiry: 1558013857,
        clientId: 'https://cv.work',
        kid: 'https://cv.work/jwks/enc_80629d551765fc59f9b7ed16f3d17690a315c585c6d756fcaa23e91918a44b24'
      },
      signature: {
        kid: 'https://cv.work/jwks/client_key',
        alg: 'RSA-SHA512',
        data: 'mqn1hDFJwtIylDLtrKPhKK8BzyRCK5YcapyFBmvNGM7vepMgaM4FheAG+u7haQwy34JxS2FVtgUjaGRJLfD/KRD0X/q1VM8CdOppRsHAJ8cb1FAl1cXd7uITOJE3QBKOaE5O9K44yVuBob1vfun/sM0UaBM7wI0vZMsiX7KMkC0='
      }
    }
    redis.store = {}
    redis.set.mockImplementation(async (key, val) => {
      redis.store[key] = val
      return 'OK'
    })
    redis.get.mockImplementation(async (key) => {
      return redis.store[key]
    })

    postgres.query.mockResolvedValue({ rows: [
      {
        client_id: 'https://cv.work',
        display_name: 'My CV',
        description: 'An app for your CV online',
        jwks_url: 'http://localhost:4000/jwks'
      },
      {
        client_id: 'https://nationalregistry.gov',
        display_name: 'National registration',
        description: 'This is the national registration of the Kingdom of Sweden',
        jwks_url: 'http://localhost:5000/jwks'
      }
    ] })
  })

  it('returns all relevant information', async () => {
    await redis.set(`consentRequest:${consentRequestId}`, JSON.stringify(consentRequest))
    const result = await getRequest(consentRequestId)

    expect(postgres.query)
      .toHaveBeenCalledWith(expect.any(String), ['https://cv.work', 'https://nationalregistry.gov'])

    expect(result).toEqual({
      ...consentRequest,
      clients: {
        'https://cv.work': {
          displayName: 'My CV',
          description: 'An app for your CV online',
          jwksUrl: 'http://localhost:4000/jwks'
        },
        'https://nationalregistry.gov': {
          displayName: 'National registration',
          description: 'This is the national registration of the Kingdom of Sweden',
          jwksUrl: 'http://localhost:5000/jwks'
        }
      }
    })
  })
})
