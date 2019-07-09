const { createClientWithServer } = require('./helpers')
const phone = require('./helpers/phone')
const postgres = require('./helpers/operatorPostgres')

describe('data', () => {
  let serviceClient, connectionId
  beforeAll(async () => {
    // Init Operator DB
    await postgres.createOperatorDb()
    await phone.clearAccount()

    await phone.createAccount({ firstName: 'Foo', lastName: 'Barsson' })

    // Create a service
    const serviceConfig = {
      defaultPermissions: [
        {
          area: 'favorite_cats',
          types: ['WRITE'],
          description: 'The cats you like the most'
        },
        {
          area: 'favorite_cats',
          types: ['READ'],
          purpose: 'To recommend you cats that you\'ll like'
        }
      ]
    }
    serviceClient = await createClientWithServer(serviceConfig)
    await serviceClient.connect()

    // Get QR code
    const { url } = await serviceClient.initializeAuthentication()

    // Send it to phone
    const { connectionRequest } = await phone.handleAuthCode({ code: url })

    // Approve it!
    let approvalResponse = new Map()
    connectionRequest.permissions.forEach(p => approvalResponse.set(p.id, true))
    connectionId = await phone.approveConnection(connectionRequest, approvalResponse)
  })

  afterAll(async (done) => {
    await phone.clearAccount()
    await postgres.clearOperatorDb()
    serviceClient.server.close(done)
  })

  describe('#write', () => {
    let domain, area
    beforeEach(() => {
      domain = serviceClient.config.clientId
      area = 'favorite_cats'
    })
    it('works using area only', async () => {
      const data = ['All of them']

      const writePromise = serviceClient.data.write(connectionId, { area, data })

      await expect(writePromise).resolves.not.toThrow()
    })
    it('works using domain and area', async () => {
      const data = ['All of them']

      const writePromise = serviceClient.data.write(connectionId, { domain, area, data })

      await expect(writePromise).resolves.not.toThrow()
    })
  })

  describe('#read', () => {
    let domain, area, data
    beforeAll(async () => {
      domain = serviceClient.config.clientId
      area = 'favorite_cats'
      data = ['All of them']

      await serviceClient.data.write(connectionId, { area, data })
    })
    it('works using area', async () => {
      const decryptedData = await serviceClient.data.read(connectionId, { area })

      expect(decryptedData).toEqual([{ domain, area, data }])
    })
    it('works using domain and area', async () => {
      const decryptedData = await serviceClient.data.read(connectionId, { domain, area })

      expect(decryptedData).toEqual([{ domain, area, data }])
    })
    it('works using domain only', async () => {
      const decryptedData = await serviceClient.data.read(connectionId, { domain })

      expect(decryptedData).toEqual([{ domain, area, data }])
    })
  })
})
