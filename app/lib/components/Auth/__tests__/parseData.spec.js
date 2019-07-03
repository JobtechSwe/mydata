import { toViewModel, toResponse } from '../parseData'

jest.mock('../../../services/crypto', () => ({
  generateKey: jest.fn().mockName('crypto.generateKey'),
}))

describe('components/Auth/parseData', () => {
  let connectionRequest
  let baseDataKey, experienceKey, nationalExperienceKey
  beforeEach(() => {
    baseDataKey = {
      e: 'AQAB',
      kid: 'http://localhost:4000/jwks/base-data',
      kty: 'RSA',
      n:
        'sgkmc6s2kOM4gNWlHlkbIpYdXD9HQU_FHRQyBmL1_8wriRHQGtF3XfoQgVKYUwxZfX94_4YQaygdKdZSQjQkXGEHlo6N4xsVx3U0qe-cSE0ER1wvLcPIrQCvixQHJSNnMJjb4VDeMSR7OW36CMrNboOKde8aNAJ8VTow9pd4feMFpPt3RYmuwQ3M7EUOdexD3h6X87TCcTHWmXxqBjVZ-cr7fFu5PZcXkVS2nGEqAThVZn6Jp4NAZm5-wn79awkSKg6skxUuP-VtTtco0XNd7SOnM8PhAX88E8Xi0kPu8LAHvgrxd19Yj-wQIgl-u3J97THTR_rbl3xKRaAAASl0bw',
      use: 'enc',
    }
    experienceKey = {
      e: 'AQAB',
      kid: 'http://localhost:4000/jwks/experience',
      kty: 'RSA',
      n:
        'sgkmc6s2kOM4gNWlHlkbIpYdXD9HQU_FHRQyBmL1_8wriRHQGtF3XfoQgVKYUwxZfX94_4YQaygdKdZSQjQkXGEHlo6N4xsVx3U0qe-cSE0ER1wvLcPIrQCvixQHJSNnMJjb4VDeMSR7OW36CMrNboOKde8aNAJ8VTow9pd4feMFpPt3RYmuwQ3M7EUOdexD3h6X87TCcTHWmXxqBjVZ-cr7fFu5PZcXkVS2nGEqAThVZn6Jp4NAZm5-wn79awkSKg6skxUuP-VtTtco0XNd7SOnM8PhAX88E8Xi0kPu8LAHvgrxd19Yj-wQIgl-u3J97THTR_rbl3xKRaAAASl0bw',
      use: 'enc',
    }
    nationalExperienceKey = {
      e: 'AQAB',
      kid: 'http://localhost:4000/jwks/national-experience',
      kty: 'RSA',
      n:
        'sgkmc6s2kOM4gNWlHlkbIpYdXD9HQU_FHRQyBmL1_8wriRHQGtF3XfoQgVKYUwxZfX94_4YQaygdKdZSQjQkXGEHlo6N4xsVx3U0qe-cSE0ER1wvLcPIrQCvixQHJSNnMJjb4VDeMSR7OW36CMrNboOKde8aNAJ8VTow9pd4feMFpPt3RYmuwQ3M7EUOdexD3h6X87TCcTHWmXxqBjVZ-cr7fFu5PZcXkVS2nGEqAThVZn6Jp4NAZm5-wn79awkSKg6skxUuP-VtTtco0XNd7SOnM8PhAX88E8Xi0kPu8LAHvgrxd19Yj-wQIgl-u3J97THTR_rbl3xKRaAAASl0bw',
      use: 'enc',
    }
    connectionRequest = {
      aud: 'mydata://account',
      description: 'An app for your CV online',
      displayName: 'My CV',
      exp: 1559912378,
      iat: 1559908778,
      iconURI: 'https://mycv.work/android-icon-96x96.png',
      iss: 'https://mycv.work',
      sid: 'dcd2a523-34ca-43f8-95e7-d91342910402',
      type: 'CONNECTION_REQUEST',
      permissions: [
        {
          area: 'baseData',
          domain: 'https://mycv.work',
          id: '18710e28-7d6c-49cf-941e-0f954bb179ae',
          lawfulBasis: 'CONSENT',
          purpose: 'In order to create a CV using our website.',
          type: 'READ',
          jwk: baseDataKey,
        },
        {
          area: 'baseData',
          description: 'Personal information.',
          domain: 'https://mycv.work',
          id: '1712ec0c-9ae6-472f-9e14-46088e51f505',
          lawfulBasis: 'CONSENT',
          type: 'WRITE',
        },
        {
          area: 'experience',
          description: 'A list of your work experiences.',
          domain: 'https://mycv.work',
          id: 'd5dab30d-b0ac-43e3-9ac8-cff8b39ca560',
          lawfulBasis: 'CONSENT',
          type: 'WRITE',
        },
        {
          area: 'experience',
          purpose: 'In order to create a CV using our website.',
          domain: 'https://mycv.work',
          id: '55c24372-6956-4891-b5ff-a6cf69fb5c8b',
          lawfulBasis: 'CONSENT',
          type: 'READ',
          jwk: experienceKey,
        },
        {
          area: 'experience',
          purpose: 'In order to create a CV using our website.',
          domain: 'https://national.gov',
          id: 'fc284cf5-b1af-4fac-b793-7d1adf8a9c60',
          lawfulBasis: 'CONSENT',
          type: 'READ',
          jwk: nationalExperienceKey,
        },
      ],
    }
  })
  describe('#toViewModel', () => {
    it('transforms a CONNECTION_REQUEST message into a view model', () => {
      const expected = {
        displayName: 'My CV',
        description: 'An app for your CV online',
        iconURI: 'https://mycv.work/android-icon-96x96.png',
        local: [
          {
            area: 'baseData',
            description: 'Personal information.',
            read: {
              area: 'baseData',
              domain: 'https://mycv.work',
              id: '18710e28-7d6c-49cf-941e-0f954bb179ae',
              lawfulBasis: 'CONSENT',
              purpose: 'In order to create a CV using our website.',
              type: 'READ',
              kid: 'http://localhost:4000/jwks/base-data',
              approved: true,
            },
            write: {
              area: 'baseData',
              description: 'Personal information.',
              domain: 'https://mycv.work',
              id: '1712ec0c-9ae6-472f-9e14-46088e51f505',
              lawfulBasis: 'CONSENT',
              type: 'WRITE',
              approved: true,
            },
          },
          {
            area: 'experience',
            description: 'A list of your work experiences.',
            read: {
              area: 'experience',
              purpose: 'In order to create a CV using our website.',
              domain: 'https://mycv.work',
              id: '55c24372-6956-4891-b5ff-a6cf69fb5c8b',
              lawfulBasis: 'CONSENT',
              type: 'READ',
              kid: 'http://localhost:4000/jwks/experience',
              approved: true,
            },
            write: {
              area: 'experience',
              description: 'A list of your work experiences.',
              domain: 'https://mycv.work',
              id: 'd5dab30d-b0ac-43e3-9ac8-cff8b39ca560',
              lawfulBasis: 'CONSENT',
              type: 'WRITE',
              approved: true,
            },
          },
        ],
        external: [
          {
            area: 'experience',
            read: {
              area: 'experience',
              purpose: 'In order to create a CV using our website.',
              domain: 'https://national.gov',
              id: 'fc284cf5-b1af-4fac-b793-7d1adf8a9c60',
              lawfulBasis: 'CONSENT',
              type: 'READ',
              kid: 'http://localhost:4000/jwks/national-experience',
              approved: true,
            },
          },
        ],
      }
      expect(toViewModel(connectionRequest)).toEqual(expected)
    })
    it('transforms a CONNECTION_REQUEST message without permissions into a view model', () => {
      connectionRequest.permissions = undefined
      const expected = {
        displayName: 'My CV',
        description: 'An app for your CV online',
        iconURI: 'https://mycv.work/android-icon-96x96.png',
        local: [],
        external: [],
      }
      expect(toViewModel(connectionRequest)).toEqual(expected)
    })
  })
  describe('#toResponse', () => {
    it('moves permissions to approved/denied', () => {
      const viewmodel = {
        displayName: 'My CV',
        description: 'An app for your CV online',
        iconURI: 'https://mycv.work/android-icon-96x96.png',
        local: [
          {
            area: 'baseData',
            description: 'Personal information.',
            read: {
              area: 'baseData',
              domain: 'https://mycv.work',
              id: '18710e28-7d6c-49cf-941e-0f954bb179ae',
              lawfulBasis: 'CONSENT',
              purpose: 'In order to create a CV using our website.',
              type: 'READ',
              kid: 'http://localhost:4000/jwks/base-data',
              approved: true,
            },
            write: {
              area: 'baseData',
              description: 'Personal information.',
              domain: 'https://mycv.work',
              id: '1712ec0c-9ae6-472f-9e14-46088e51f505',
              lawfulBasis: 'CONSENT',
              type: 'WRITE',
              approved: true,
            },
          },
          {
            area: 'experience',
            description: 'A list of your work experiences.',
            read: {
              area: 'experience',
              purpose: 'In order to create a CV using our website.',
              domain: 'https://mycv.work',
              id: '55c24372-6956-4891-b5ff-a6cf69fb5c8b',
              lawfulBasis: 'CONSENT',
              type: 'READ',
              kid: 'http://localhost:4000/jwks/experience',
              approved: false,
            },
            write: {
              area: 'experience',
              description: 'A list of your work experiences.',
              domain: 'https://mycv.work',
              id: 'd5dab30d-b0ac-43e3-9ac8-cff8b39ca560',
              lawfulBasis: 'CONSENT',
              type: 'WRITE',
              approved: false,
            },
          },
        ],
        external: [
          {
            area: 'experience',
            read: {
              area: 'experience',
              purpose: 'In order to create a CV using our website.',
              domain: 'https://national.gov',
              id: 'fc284cf5-b1af-4fac-b793-7d1adf8a9c60',
              lawfulBasis: 'CONSENT',
              type: 'READ',
              kid: 'http://localhost:4000/jwks/national-experience',
              approved: true,
            },
          },
        ],
      }
      const expected = new Map([
        ['18710e28-7d6c-49cf-941e-0f954bb179ae', true],
        ['1712ec0c-9ae6-472f-9e14-46088e51f505', true],
        ['55c24372-6956-4891-b5ff-a6cf69fb5c8b', false],
        ['d5dab30d-b0ac-43e3-9ac8-cff8b39ca560', false],
        ['fc284cf5-b1af-4fac-b793-7d1adf8a9c60', true],
      ])

      expect(toResponse(viewmodel)).toEqual(expected)
    })
  })
})
