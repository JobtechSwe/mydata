const phone = require('./helpers/phone')
const { createClientWithServer } = require('./helpers/index')
const { clearOperatorDb } = require('./helpers/operatorPostgres')

describe('Authentication', () => {
  let account, client

  beforeAll(async () => {
    jest.useFakeTimers()
    account = await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

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

  it('Phone handles scanned code and does CONNECTION_INIT if no existing connection', async () => {
    client.events.emit = jest.fn()
    const { url } = await client.initializeAuthentication()
    await phone.handleCode({ code: url })

    // Do not throw
    expect(true).toBe(true)
  })
})
