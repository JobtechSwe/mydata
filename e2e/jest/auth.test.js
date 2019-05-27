const phone = require('./helpers/phone')
const { createClientWithServer } = require('./helpers/index')
const { clearOperatorDb } = require('./helpers/operatorPostgres')

describe('Authentication', () => {
  let client

  beforeAll(async () => {
    jest.useFakeTimers()
    await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

    // Get client going
    client = await createClientWithServer()
    await client.connect()
  })

  afterAll(async (done) => {
    await phone.clearAccount()
    await clearOperatorDb()
    client.server.close(done)
  })

  it('Client provides a proper auth url', async () => {
    const { url } = await client.initializeAuthentication()
    expect(url).toEqual(expect.stringContaining('mydata://account'))
  })

  it('Auth flow for new connection', async () => {
    // Auth url -> phone
    const { url } = await client.initializeAuthentication()
    await phone.handleCode({ code: url })

    expect(true).toBe(true)
  })
})
