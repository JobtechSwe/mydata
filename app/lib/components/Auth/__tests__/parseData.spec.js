import { toViewModel, toConnectionRequest } from '../parseData'

describe('components/Consent/parseData', () => {
  describe('#toViewModel', () => {
    let connectionRequest
    beforeEach(() => {
      connectionRequest = {
        permissions: [
          {
            area: 'baseData',
            domain: 'https://mycv.work',
            id: '18710e28-7d6c-49cf-941e-0f954bb179ae',
            lawfulBasis: 'CONSENT',
            purpose: 'In order to create a CV using our website.',
            type: 'READ',
            jwk: {
              e: 'AQAB',
              kid:
                'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
              kty: 'RSA',
              n:
                'sgkmc6s2kOM4gNWlHlkbIpYdXD9HQU_FHRQyBmL1_8wriRHQGtF3XfoQgVKYUwxZfX94_4YQaygdKdZSQjQkXGEHlo6N4xsVx3U0qe-cSE0ER1wvLcPIrQCvixQHJSNnMJjb4VDeMSR7OW36CMrNboOKde8aNAJ8VTow9pd4feMFpPt3RYmuwQ3M7EUOdexD3h6X87TCcTHWmXxqBjVZ-cr7fFu5PZcXkVS2nGEqAThVZn6Jp4NAZm5-wn79awkSKg6skxUuP-VtTtco0XNd7SOnM8PhAX88E8Xi0kPu8LAHvgrxd19Yj-wQIgl-u3J97THTR_rbl3xKRaAAASl0bw',
              use: 'enc',
            },
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
            jwk: {
              e: 'AQAB',
              kid:
                'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
              kty: 'RSA',
              n:
                'sgkmc6s2kOM4gNWlHlkbIpYdXD9HQU_FHRQyBmL1_8wriRHQGtF3XfoQgVKYUwxZfX94_4YQaygdKdZSQjQkXGEHlo6N4xsVx3U0qe-cSE0ER1wvLcPIrQCvixQHJSNnMJjb4VDeMSR7OW36CMrNboOKde8aNAJ8VTow9pd4feMFpPt3RYmuwQ3M7EUOdexD3h6X87TCcTHWmXxqBjVZ-cr7fFu5PZcXkVS2nGEqAThVZn6Jp4NAZm5-wn79awkSKg6skxUuP-VtTtco0XNd7SOnM8PhAX88E8Xi0kPu8LAHvgrxd19Yj-wQIgl-u3J97THTR_rbl3xKRaAAASl0bw',
              use: 'enc',
            },
          },
          {
            area: 'experience',
            purpose: 'In order to create a CV using our website.',
            domain: 'https://national.gov',
            id: 'fc284cf5-b1af-4fac-b793-7d1adf8a9c60',
            lawfulBasis: 'CONSENT',
            type: 'READ',
            jwk: {
              e: 'AQAB',
              kid:
                'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
              kty: 'RSA',
              n:
                'sgkmc6s2kOM4gNWlHlkbIpYdXD9HQU_FHRQyBmL1_8wriRHQGtF3XfoQgVKYUwxZfX94_4YQaygdKdZSQjQkXGEHlo6N4xsVx3U0qe-cSE0ER1wvLcPIrQCvixQHJSNnMJjb4VDeMSR7OW36CMrNboOKde8aNAJ8VTow9pd4feMFpPt3RYmuwQ3M7EUOdexD3h6X87TCcTHWmXxqBjVZ-cr7fFu5PZcXkVS2nGEqAThVZn6Jp4NAZm5-wn79awkSKg6skxUuP-VtTtco0XNd7SOnM8PhAX88E8Xi0kPu8LAHvgrxd19Yj-wQIgl-u3J97THTR_rbl3xKRaAAASl0bw',
              use: 'enc',
            },
          },
        ],
        aud: 'mydata://account',
        description: 'An app for your CV online',
        displayName: 'My CV',
        exp: 1559912378,
        iat: 1559908778,
        iconURI: 'https://mycv.work/android-icon-96x96.png',
        iss: 'https://mycv.work',
        sid: 'dcd2a523-34ca-43f8-95e7-d91342910402',
        type: 'CONNECTION_REQUEST',
      }
    })

    it('works', () => {
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
              kid:
                'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
            },
            write: {
              area: 'baseData',
              description: 'Personal information.',
              domain: 'https://mycv.work',
              id: '1712ec0c-9ae6-472f-9e14-46088e51f505',
              lawfulBasis: 'CONSENT',
              type: 'WRITE',
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
              kid:
                'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
            },
            write: {
              area: 'experience',
              description: 'A list of your work experiences.',
              domain: 'https://mycv.work',
              id: 'd5dab30d-b0ac-43e3-9ac8-cff8b39ca560',
              lawfulBasis: 'CONSENT',
              type: 'WRITE',
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
              kid:
                'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
            },
          },
        ],
      }
      expect(toViewModel(connectionRequest)).toEqual(expected)
    })
  })

  describe('#toConnectionRequest', () => {
    let local
    let external
    beforeEach(() => {
      local = [
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
            kid:
              'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
          },
          write: {
            area: 'baseData',
            description: 'Personal information.',
            domain: 'https://mycv.work',
            id: '1712ec0c-9ae6-472f-9e14-46088e51f505',
            lawfulBasis: 'CONSENT',
            type: 'WRITE',
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
            kid:
              'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
          },
          write: {
            area: 'experience',
            description: 'A list of your work experiences.',
            domain: 'https://mycv.work',
            id: 'd5dab30d-b0ac-43e3-9ac8-cff8b39ca560',
            lawfulBasis: 'CONSENT',
            type: 'WRITE',
          },
        },
      ]

      external = [
        {
          area: 'experience',
          read: {
            area: 'experience',
            purpose: 'In order to create a CV using our website.',
            domain: 'https://national.gov',
            id: 'fc284cf5-b1af-4fac-b793-7d1adf8a9c60',
            lawfulBasis: 'CONSENT',
            type: 'READ',
            kid:
              'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
          },
        },
      ]
    })

    it('works', () => {
      const expected = {
        approved: [
          {
            area: 'baseData',
            domain: 'https://mycv.work',
            id: '18710e28-7d6c-49cf-941e-0f954bb179ae',
            lawfulBasis: 'CONSENT',
            purpose: 'In order to create a CV using our website.',
            type: 'READ',
            kid:
              'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
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
            purpose: 'In order to create a CV using our website.',
            domain: 'https://mycv.work',
            id: '55c24372-6956-4891-b5ff-a6cf69fb5c8b',
            lawfulBasis: 'CONSENT',
            type: 'READ',
            kid:
              'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
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
            domain: 'https://national.gov',
            id: 'fc284cf5-b1af-4fac-b793-7d1adf8a9c60',
            lawfulBasis: 'CONSENT',
            type: 'READ',
            kid:
              'http://localhost:4000/jwks/enc_1d2cbc575751efb6e498f5c00c5108d48fa94dbf3994fa9ea06bbf3c97f6aa05',
          },
        ],
      }

      expect(toConnectionRequest({ local, external })).toEqual(expected)
    })
  })
})
