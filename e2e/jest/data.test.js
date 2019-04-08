const phone = require('./helpers/phone')
const { createClientWithServer } = require('./helpers/index')
const { clearOperatorDb } = require('./helpers/operatorPostgres')

describe('Data', () => {
  let client

  beforeAll(async () => {
    await phone.createAccount({ firstName: 'John', lastName: 'Doe' })

    // Get client going
    client = await createClientWithServer()
    await client.connect()
  })

  afterAll(async (done) => {
    await phone.clearAccount()
    await clearOperatorDb()
    client.server.close(done)
  })

  it('Can read/write data', async (done) => {
    const request = {
      scope: [
        {
          domain: client.config.clientId,
          area: 'test-data',
          description: 'Test data lives a happy life here.',
          permissions: [ 'write' ],
          purpose: 'Because I say so.',
          lawfulBasis: 'CONSENT'
        }
      ],
      expiry: 12352134153
    }

    // Start listening for event
    client.events.on('CONSENT_APPROVED', async (event) => {
      try {
        // Read data
        const initialData = await client.data.auth(event.accessToken).read({
          domain: client.config.clientId,
          area: 'test-data'
        })
        expect(initialData).toEqual({
          [client.config.clientId]: {
            'test-data': {}
          }
        })

        // Write data
        await client.data.auth(event.accessToken).write({
          domain: client.config.clientId,
          area: 'test-data',
          data: {
            age: 64,
            interests: [ 'cooking', 'fishing', 'books', 'gardening' ]
          }
        })

        // Read data again
        const data = await client.data.auth(event.accessToken).read({
          domain: client.config.clientId,
          area: 'test-data'
        })

        expect(data).toEqual({
          [client.config.clientId]: {
            'test-data': {
              age: 64,
              interests: [ 'cooking', 'fishing', 'books', 'gardening' ]
            }
          }
        })

        done()
      } catch (error) {
        done(error)
      }
    })

    // Do request
    const { url } = await client.consents.request(request)

    // User gets the request and approves it
    const { data } = await phone.getConsentRequest(url)
    await phone.approveConsentRequest(data)
  })
})
