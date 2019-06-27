const express = require('express')
const { createClient } = require('./helpers/index')
const postgres = require('./helpers/operatorPostgres')

describe('Service', () => {
  let server, client

  beforeAll(async () => {
    await postgres.createOperatorDb()
    const app = express()
    await new Promise((resolve, reject) => {
      server = app.listen(0, (err) => {
        if (err) {
          return reject(err)
        }
        // Create client with the port that the current test server is using
        client = createClient(server.address().port)

        // Hook up routes
        app.use(client.routes)
        resolve()
      })
    })
  })
  afterEach(async () => {
    await postgres.clearOperatorDb()
  })
  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('Can connect to operator', async () => {
    await client.connect()

    // Should not throw
    expect(true).toBe(true)
  })
})
