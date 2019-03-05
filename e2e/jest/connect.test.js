const express = require('express')
const { createClient } = require('./helpers/index')

describe('Connect', () => {
  let server, client

  beforeEach(done => {
    // TODO: Tell Operator to reset db

    const app = express()
    server = app.listen(0, () => {
      // Create client with the port that the current test server is using
      client = createClient(server.address().port)

      // Hook up routes
      app.use(client.routes)

      // Setup done
      done()
    })
  })

  afterEach(done => {
    server.close(done)
  })

  it('Can connect to operator', async () => {
    await client.connect()

    // Should not throw
    expect(true)
  })
})