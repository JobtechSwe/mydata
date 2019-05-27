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
  keyValueStore: keyValueStore
}

module.exports = create(config)
