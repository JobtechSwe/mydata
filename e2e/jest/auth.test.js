const phone = require('./helpers/phone')
const { createClientWithServer } = require('./helpers/index')
const { clearOperatorDb } = require('./helpers/operatorPostgres')
const { v4Regexp } = require('./helpers/regexp')

describe('Authentication', () => {
  let client

  beforeAll(async () => {
    jest.useFakeTimers()
    await phone.clearStorage()
    await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

    // Get client going
    client = await createClientWithServer()
    await client.connect()
  })

  afterAll(async (done) => {
    await phone.clearStorage()
    await clearOperatorDb()
    client.server.close(done)
  })

  it('Client provides a proper auth url', async () => {
    const { url } = await client.initializeAuthentication()
    expect(url).toEqual(expect.stringContaining('mydata://account'))
  })

  it('Auth flow for new connection', async () => {
    // Initial state, expect no connections
    const connectionsBefore = await phone.getConnections()
    expect(connectionsBefore).toEqual([])

    // Auth url flowes from service -> phone -> service -> phone
    const { url } = await client.initializeAuthentication()
    const { connectionRequest } = await phone.handleAuthCode({ code: url })

    // Approve it!
    await phone.approveConnection(connectionRequest)

    // Get connections again
    const connectionsAfter = await phone.getConnections()

    // After state, expect one new connection
    expect(connectionsAfter.length).toBe(1)
    expect(connectionsAfter[0].connectionId).toMatch(v4Regexp)
    expect(connectionsAfter[0].serviceId).toContain('http://')
  })

  it.skip('Auth flow for existing connection (login)', async () => {

  })
})
