import { toViewModel } from '../parseData'

describe('components/Consent/parseData', () => {
  describe('#toViewModel', () => {
    let consentRequest
    beforeEach(() => {
      consentRequest = {
        data: {
          scope: [
            {
              domain: 'https://mycv.work',
              area: 'experience',
              description: 'A list of your work experiences.',
              permissions: [
                'READ',
                'WRITE',
              ],
              purpose: 'In order to create a CV using our website.',
              lawfulBasis: 'CONSENT',
            },
            {
              domain: 'https://mycv.work',
              area: 'education',
              description: 'A list of your educations.',
              permissions: [
                'READ',
                'WRITE',
              ],
              purpose: 'In order to create a CV using our website.',
              lawfulBasis: 'CONSENT',
            },
            {
              domain: 'https://nationalregistry.gov',
              area: 'firstName',
              description: 'Your first name.',
              permissions: [
                'READ',
              ],
              purpose: 'In order to create a CV using our website.',
              lawfulBasis: 'CONSENT',
            },
            {
              domain: 'https://nationalregistry.gov',
              area: 'lastName',
              description: 'Your last name.',
              permissions: [
                'READ',
              ],
              purpose: 'In order to create a CV using our website.',
              lawfulBasis: 'CONSENT',
            },
          ],
          expiry: 1558078050,
          clientId: 'https://mycv.work',
          kid: 'https://mycv.work/jwks/enc_66e8d07b3138c7483cf43b20a10c6c9ba55c11342d40ec2dfa457e6586829ed6',
        },
        clients: {
          'https://nationalregistry.gov': {
            displayName: 'National registration',
            description: 'This is the national registration of the Kingdom of Sweden',
            jwksUrl: 'https://nationalregistry.gov/jwks',
          },
          'https://mycv.work': {
            displayName: 'My CV',
            description: 'An app for your CV online',
            jwksUrl: 'https://mycv.work/jwks',
          },
        },
      }
    })
    it('works', () => {
      const expected = {
        client: {
          displayName: 'My CV',
          description: 'An app for your CV online',
          jwksUrl: 'https://mycv.work/jwks',
          areas: [
            {
              domain: 'https://mycv.work',
              area: 'experience',
              description: 'A list of your work experiences.',
              permissions: [
                'READ',
                'WRITE',
              ],
              purpose: 'In order to create a CV using our website.',
              lawfulBasis: 'CONSENT',
            },
            {
              domain: 'https://mycv.work',
              area: 'education',
              description: 'A list of your educations.',
              permissions: [
                'READ',
                'WRITE',
              ],
              purpose: 'In order to create a CV using our website.',
              lawfulBasis: 'CONSENT',
            },
          ],
        },
        externals: [
          {
            client: {
              displayName: 'National registration',
              description: 'This is the national registration of the Kingdom of Sweden',
              jwksUrl: 'https://nationalregistry.gov/jwks',
              areas: [
                {
                  domain: 'https://nationalregistry.gov',
                  area: 'firstName',
                  description: 'Your first name.',
                  permissions: [
                    'READ',
                  ],
                  purpose: 'In order to create a CV using our website.',
                  lawfulBasis: 'CONSENT',
                },
                {
                  domain: 'https://nationalregistry.gov',
                  area: 'lastName',
                  description: 'Your last name.',
                  permissions: [
                    'READ',
                  ],
                  purpose: 'In order to create a CV using our website.',
                  lawfulBasis: 'CONSENT',
                },
              ],
            },
          },
        ],
      }
      expect(toViewModel(consentRequest)).toEqual(expected)
    })
  })
})
