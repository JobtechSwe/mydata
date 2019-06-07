import { toViewModel } from '../parseData'

describe('components/Consent/parseData', () => {
  describe('#toViewModel', () => {
    let consentRequest
    beforeEach(() => {
      consentRequest = {
        permissions: [
          {
            area: 'baseData',
            domain: 'https://mycv.work',
            id: 'f7f8b408-088d-47fe-b2d9-050582101fd2',
            lawfulBasis: 'CONSENT',
            purpose: 'In order to create a CV using our website.',
            type: 'READ',
          },
          {
            area: 'baseData',
            description: 'Personal information.',
            domain: 'https://mycv.work',
            id: '3e2ad237-8a03-41c0-aa52-7700abc22896',
            lawfulBasis: 'CONSENT',
            type: 'WRITE',
          },
          {
            area: 'experience',
            description: 'A list of your work experiences.',
            domain: 'https://mycv.work',
            id: '3e2ad237-8a03-41c0-aa52-7700abc22896',
            lawfulBasis: 'CONSENT',
            type: 'WRITE',
          },
          {
            area: 'experience',
            purpose: 'In order to create a CV using our website.',
            domain: 'https://mycv.work',
            id: '3e2ad237-8a03-41c0-aa52-7700abc22896',
            lawfulBasis: 'CONSENT',
            type: 'READ',
          },
          {
            area: 'experience',
            purpose: 'In order to create a CV using our website.',
            domain: 'https://national.gov',
            id: '3e2ad237-8a03-41c0-aa52-7700abc22896',
            lawfulBasis: 'CONSENT',
            type: 'READ',
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

    Object.values({
      baseData: {},
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
              id: 'f7f8b408-088d-47fe-b2d9-050582101fd2',
              lawfulBasis: 'CONSENT',
              purpose: 'In order to create a CV using our website.',
              type: 'READ',
            },
            write: {
              area: 'baseData',
              description: 'Personal information.',
              domain: 'https://mycv.work',
              id: '3e2ad237-8a03-41c0-aa52-7700abc22896',
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
              id: '3e2ad237-8a03-41c0-aa52-7700abc22896',
              lawfulBasis: 'CONSENT',
              type: 'READ',
            },
            write: {
              area: 'experience',
              description: 'A list of your work experiences.',
              domain: 'https://mycv.work',
              id: '3e2ad237-8a03-41c0-aa52-7700abc22896',
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
              id: '3e2ad237-8a03-41c0-aa52-7700abc22896',
              lawfulBasis: 'CONSENT',
              type: 'READ',
            },
          },
        ],
      }
      expect(toViewModel(consentRequest)).toEqual(expected)
    })
  })
})
