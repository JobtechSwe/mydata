import React from 'react'
import { shallow } from 'react-native-testing-library'
import ConsentModal from '../ConsentModal'

const mock = {
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

describe('components/Consent/ConsentModal', () => {
  it('should render without errors', () => {
    const { output } = shallow(
      <ConsentModal visible={true} data={{ viewModel: mock }} />
    )

    expect(output).toMatchSnapshot()
  })
})
