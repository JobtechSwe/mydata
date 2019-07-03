const { createClientWithServer, createSampleRequest } = require('./helpers/index')
const { v4Regexp } = require('./helpers/regexp')
const phone = require('./helpers/phone')
const { decode } = require('jsonwebtoken')
const { clearOperatorDb } = require('./helpers/operatorPostgres')

describe.skip('Client', () => {
  let client

  beforeAll(async () => {
    // Phone setup
    await phone.createAccount({ firstName: 'Einar', lastName: 'Pejnar' })

    // Get client going
    client = await createClientWithServer()
    await client.connect()
  })

  afterAll(async done => {
    await clearOperatorDb()
    await phone.clearAccount()
    client.server.close(done)
  })

  it('Get consentRequestId', async () => {
    const sampleRequest = createSampleRequest(client.config.clientId)
    const res = await client.consents.request(sampleRequest)

    expect(res).toEqual({
      expires: expect.stringMatching(/^\d+$/),
      id: expect.stringMatching(v4Regexp),
      url: expect.stringMatching(/^mydata:\/\/register\//)
    })
  })

  it('Gets accessToken (jwt) when consent is approved', async (done) => {
    const sampleRequest = createSampleRequest(client.config.clientId)

    client.events.on('CONSENT_APPROVED', (event) => {
      try {
        expect(decode(event.accessToken)).not.toBe(null)
        done()
      } catch (error) {
        done(error)
      }
    })

    const { url } = await client.consents.request(sampleRequest)
    const consentRequest = await phone.getConsentRequest(url)
    await phone.approveConsentRequest(consentRequest)
  })
})

describe.skip('Phone', () => {
  let clients

  beforeAll(async () => {
    // Phone setup
    await phone.createAccount({ firstName: 'Einar', lastName: 'Pejnar' })

    // Get client going
    clients = await Promise.all([
      createClientWithServer(),
      createClientWithServer(),
      createClientWithServer()
    ])

    await Promise.all(clients.map(client => client.connect()))
  })

  afterAll(async () => {
    await clearOperatorDb()
    await phone.clearAccount()

    clients.forEach(c => {
      c.server.close()
    })
  })

  it('Can get all consents for the account', async () => {
    const firstResponse = await phone.getAllConsents()

    // First the list should be empty
    expect(firstResponse).toEqual([])

    // Do several consent requests from different clients
    const consentRequests = await Promise.all(clients.map(client => {
      const sampleRequest = createSampleRequest(client.config.clientId)
      return client.consents.request(sampleRequest)
    }))

    // Get and approve all consent requests
    await Promise.all(consentRequests
      .map(x => x.url)
      .map(url => phone.getAndApproveConsentRequest(url))
    )

    const expectedArray = Array(3).fill({
      clientDescription: 'A nice description of your fantastic service',
      clientDisplayName: 'The name of your service',
      clientId: expect.stringMatching(/^http[s]?/),
      consentId: expect.stringMatching(v4Regexp)
    })

    // Now check again
    const secondResponse = await phone.getAllConsents()
    expect(secondResponse.length).toBe(3)
    expect(secondResponse).toEqual(expectedArray)
  })
})
