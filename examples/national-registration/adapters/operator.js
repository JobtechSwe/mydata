const { create, utils } = require('@egendata/client')

const client = create({
  displayName: 'National registration',
  description: 'This is the national registration of the Kingdom of Sweden',
  clientId: process.env.CLIENT_ID || 'http://localhost:5000', // Application domain with protocol
  operator: process.env.OPERATOR_URL || 'http://localhost:3000', // URL of Operator
  clientKeys: {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY
  },
  jwksPath: '/jwks',
  eventsPath: '/events',
  keyValueStore: utils.createMemoryStore()
})

module.exports = client
