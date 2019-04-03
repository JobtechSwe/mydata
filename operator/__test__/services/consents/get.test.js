const { get } = require('../../../lib/services/consents')
const pg = require('../../../__mocks__/pg')
jest.mock('../../../lib/adapters/redis')

describe('services/consents #get', () => {
  beforeEach(() => {
    pg.client.query.mockResolvedValue({
      rows: [
        {
          consent_id: 'b2f5659f-6391-4068-9366-ae4803bd0a20',
          client_id: 'https://someservice.tld',
          processed: new Date(1551196280802),
          display_name: 'Some Silly Service',
          description: 'Yeah, it likes does stuff you know',
          client_key: '----- BEGIN RSA END SANITY -----'
        }, {
          consent_id: 'f4d16582-0008-4db3-86c4-29ea15e91038',
          client_id: 'https://someservice.tld',
          processed: new Date(1443333288888),
          display_name: 'Some Silly Service',
          description: 'Yeah, it likes does stuff you know',
          client_key: '----- BEGIN RSA END SANITY -----'
        }
      ]
    })
  })
  afterEach(() => {
    pg.clearMocks()
    pg.restoreDefaults()
  })

  it('queries the db', async () => {
    await get('account-id', 'client-id')
    expect(pg.client.query).toHaveBeenCalledTimes(1)
    expect(pg.client.query).toHaveBeenCalledWith(expect.anything(), ['account-id', 'client-id'])
  })

  it('translates the column names', async () => {
    const result = await get('account-id', 'client-id')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      consentId: 'b2f5659f-6391-4068-9366-ae4803bd0a20',
      clientId: 'https://someservice.tld',
      processedAt: expect.any(Date),
      clientDisplayName: 'Some Silly Service',
      clientDescription: 'Yeah, it likes does stuff you know',
      clientKey: '----- BEGIN RSA END SANITY -----'
    })
  })
})
