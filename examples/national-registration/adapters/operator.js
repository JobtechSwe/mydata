const { create, utils } = require('@mydata/client')

const client = create({
  displayName: 'National registration',
  description: 'This is the national registration of the Kingdom of Sweden',
  clientId: process.env.CLIENT_ID || 'http://localhost:3999', // Application domain with protocol
  operator: process.env.OPERATOR_URL || 'http://localhost:3000', // URL of Operator
  clientKeys: {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY
  },
  jwksPath: '/jwks',
  eventsPath: '/events',
  keyValueStore: utils.createMemoryStore()
})

client.events.on('CONSENT_APPROVED', async event => {
  console.log('GOT CONSENT APPROVED IN ADAPTER')
  try {
    await client.keyProvider.keyValueStore.save(`id/${event.id}`, { accessToken: event.accessToken })
  } catch (error) {
    console.error('Could not save to keyValueStore', error)
  }
})

module.exports = client
