const { create } = require('@egendata/client')
const keyValueStore = require('../services/keyValueStore')
const config = {
  displayName: 'My CV',
  description: 'An app for your CV online',
  iconURI: 'http://localhost:4000/android-icon-96x96.png',
  clientId: process.env.CLIENT_ID || 'http://localhost:4000',
  operator: process.env.OPERATOR_URL || 'http://localhost:3000',
  jwksPath: '/jwks',
  eventsPath: '/events',
  clientKeys: {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY
  },
  defaultPermissions: [
    {
      area: 'baseData',
      types: ['READ', 'WRITE'],
      purpose: 'In order to create a CV using our website.',
      description: 'Personal information.'
    },
    {
      area: 'experience',
      types: ['READ', 'WRITE'],
      purpose: 'In order to create a CV using our website.',
      description: 'A list of your work experiences.'
    },
    {
      area: 'education',
      types: ['READ', 'WRITE'],
      purpose: 'In order to create a CV using our website.',
      description: 'A list of your educations.'
    },
    {
      area: 'languages',
      types: ['READ', 'WRITE'],
      purpose: 'In order to create a CV using our website.',
      description: 'A list of your language proficiencies.'
    }
  ],
  keyValueStore: keyValueStore
}

module.exports = create(config)
