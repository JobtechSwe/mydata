const phone = require('./helpers/phone')
const { createClientWithServer } = require('./helpers/index')
const { clearOperatorDb } = require('./helpers/operatorPostgres')

describe('Data', () => {
  let client

  beforeEach(async () => {
    await phone.createAccount({ firstName: 'John', lastName: 'Doe' })

    // Get client going
    client = await createClientWithServer()
    await client.connect()
  })

  afterEach(async done => {
    await phone.clearAccount()
    await clearOperatorDb()
    client.server.close(done)
  })

  it('Can read/write data', async done => {
    const request = {
      scope: [
        {
          domain: client.config.clientId,
          area: 'test-data',
          description: 'Test data lives a happy life here.',
          permissions: ['write'],
          purpose: 'Because I say so.',
          lawfulBasis: 'CONSENT'
        }
      ],
      expiry: 12352134153
    }

    // Start listening for event
    client.events.on('CONSENT_APPROVED', async event => {
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
            interests: ['cooking', 'fishing', 'books', 'gardening']
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
              interests: ['cooking', 'fishing', 'books', 'gardening']
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
    await phone.getAndApproveConsentRequest(url)
  })

  it('Can perform simultaneous writes', async done => {
    const request = {
      scope: [
        {
          domain: client.config.clientId,
          area: 'test-data-1',
          description: 'Test data lives a happy life here.',
          permissions: ['write'],
          purpose: 'Because I say so.',
          lawfulBasis: 'CONSENT'
        },
        {
          domain: client.config.clientId,
          area: 'test-data-2',
          description: 'Test data lives a happy life here.',
          permissions: ['write'],
          purpose: 'Because I say so.',
          lawfulBasis: 'CONSENT'
        },
        {
          domain: client.config.clientId,
          area: 'test-data-3',
          description: 'Test data lives a happy life here.',
          permissions: ['write'],
          purpose: 'Because I say so.',
          lawfulBasis: 'CONSENT'
        }
      ],
      expiry: 12352134153
    }

    // Start listening for event
    client.events.on('CONSENT_APPROVED', async event => {
      try {
        // Read data
        const initialData = await client.data.auth(event.accessToken).read({
          domain: client.config.clientId,
          area: 'test-data-1'
        })
        expect(initialData).toEqual({
          [client.config.clientId]: {
            'test-data-1': {}
          }
        })

        // Write data
        await Promise.all([
          client.data.auth(event.accessToken).write({
            domain: client.config.clientId,
            area: 'test-data-1',
            data: {
              age: 64,
              interests: ['cooking', 'fishing', 'books', 'gardening']
            }
          }),
          client.data.auth(event.accessToken).write({
            domain: client.config.clientId,
            area: 'test-data-2',
            data: {
              age: 64,
              interests: ['cooking', 'fishing', 'books', 'gardening']
            }
          }),
          client.data.auth(event.accessToken).write({
            domain: client.config.clientId,
            area: 'test-data-3',
            data: {
              age: 64,
              interests: ['cooking', 'fishing', 'books', 'gardening']
            }
          })
        ])

        // Read data again
        const [data1, data2, data3] = await Promise.all([
          client.data.auth(event.accessToken).read({
            domain: client.config.clientId,
            area: 'test-data-1'
          }),
          client.data.auth(event.accessToken).read({
            domain: client.config.clientId,
            area: 'test-data-2'
          }),
          client.data.auth(event.accessToken).read({
            domain: client.config.clientId,
            area: 'test-data-3'
          })
        ])

        expect(data1).toEqual({
          [client.config.clientId]: {
            'test-data-1': {
              age: 64,
              interests: ['cooking', 'fishing', 'books', 'gardening']
            }
          }
        })

        expect(data2).toEqual({
          [client.config.clientId]: {
            'test-data-2': {
              age: 64,
              interests: ['cooking', 'fishing', 'books', 'gardening']
            }
          }
        })

        expect(data3).toEqual({
          [client.config.clientId]: {
            'test-data-3': {
              age: 64,
              interests: ['cooking', 'fishing', 'books', 'gardening']
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
    await phone.getAndApproveConsentRequest(url)
  })
})
