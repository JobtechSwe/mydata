const { create, utils: { createMemoryStore } } = require('../../../client/lib')
const express = require('express')
const ipHelper = require('./ip')

const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQDHKt4EE+WaaA6+9xuR60KbL7gfn7IEKnSrXyDOZCSwe5pqDlMM\naA/mxiK7wvmyBwZrUBPkrnWIy7WDoxF9x56D8NqBO/szYSJURTgQdmhpTKM1s7LC\naqn4QLw3ZGRnkvEnyY6NVY6M8QPokFY4zJlNvlp8NWdHGNad/jmXIZKjpwIDAQAB\nAoGAZSKYcJul6N1UN5aFcnhzbxgxOCXAoKrqaac5onRpyRBK3fX+J/ujr30HYC7m\n2ocEtHOKVoJcfqVqu7iPhj5aeCD9iKl9vtspMF3El4PDsq4i3R7pM+gajOWk6vhV\nooFtXD/EwbscwmcVwxS19JHE1q/QDNKuPOMcAmjzYmIfVeECQQD4AZ9otmTcPUoI\nMO+RZztC2V+HqV+W7lL6b7S1sfUJmWj/nqdWEeNrSMGqPd59j0Li2dsssd1RNuSR\nGsiOBLcxAkEAzZZCfVEgoz/E+aBK3rfZ5A1l8IpCs1/pfZQxSSSo5jFWwvmt83+K\n/ez7oeCeQFndSCVt2ZVsWqb3eX3UjqoCVwJABgwUFPuNjgk4iuaWkNcRjNm8CJTK\nreV1xIGAyIVkUi2Zb9Iwhlq9TtphToNfr3QUz288duSHXvmVrSwYA859oQJBAKsr\n3nREpe4GXFSTF4NUhECSvzuFgn+i7d83Ecoakd4HWnvAMws4OFuvgtuHD3v41nsJ\nXur4tFzOA+LN17po5sUCQFJbubbpJDp70dyJ8XlJTbXvFMJtTbs3dy8n5dmzXwCa\nU1/LgYCwvPycA5NAPzE42fHWjbZkNvRamMQRlBX8Nl0=\n-----END RSA PRIVATE KEY-----\n`

const host = process.env.DOCKER ? ipHelper.getDockerInterfaceAddress() : 'localhost'

const createClient = (port, config = {}) => {
  const defaultSettings = {
    displayName: 'The name of your service',
    description: 'A nice description of your fantastic service',
    iconURI: `http://${host}:${port}/icon.png`,
    clientId: `http://${host}:${port}`,
    operator: process.env.OPERATOR_URL,
    clientKey: PRIVATE_KEY,
    jwksPath: '/jwks',
    eventsPath: '/events',
    keyValueStore: createMemoryStore()
  }
  return create({ ...defaultSettings, ...config })
}

const createClientWithServer = (serviceConfig) => {
  return new Promise((resolve, reject) => {
    const app = express()
    const server = app.listen(0, () => {
      // Create client with the port that the current test server is using
      const client = createClient(server.address().port, serviceConfig)

      // Hook up routes
      app.use(client.routes)

      // Append server to client so that it can be closed when tests are done
      client.server = server

      resolve(client)
    })
  })
}

module.exports = {
  createClient,
  createClientWithServer
}
