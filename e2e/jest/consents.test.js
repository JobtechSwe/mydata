const { createClientWithServer, createSampleRequest } = require('./helpers/index')
const axios = require('axios')
const { v4Regexp } = require ('./helpers/regexp')
const phone = require('./helpers/phone')
const { decode } = require('jsonwebtoken')

describe('Client', () => {
  let client

  beforeAll(async () => {
    // Phone setup
    await phone.setConfig({ OPERATOR_URL: 'http://operator:3000/api' })
    await phone.createAccount({ firstName: 'Einar', lastName: 'Pejnar' })

    // TODO: Tell Operator to reset db

    // Get client going
    client = await createClientWithServer()
    await client.connect()
  })

  afterAll(done => {
    client.server.close(done)
  })

  it('Get consentRequestId', async () => {
    const sampleRequest = createSampleRequest(client.config.clientId)
    const res = await client.consents.request(sampleRequest)

    expect(res).toEqual({
      expires: expect.stringMatching(/^\d+$/),
      id: expect.stringMatching(v4Regexp),
      link: expect.stringMatching(/^mydata:\/\/register\//)
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

    const { id } = await client.consents.request(sampleRequest)
    const { data } = await phone.getConsentRequest(id)
    await phone.approveConsentRequest(data)
  })
})