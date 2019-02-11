const { get } = require('../../../lib/services/consents')
const redis = require('../../../lib/adapters/redis')
const pg = require('../../../__mocks__/pg')
jest.mock('../../../lib/adapters/redis')

describe('services/consents #get', () => {
  beforeEach(() => {
    redis.set.mockResolvedValue('OK')
    pg.client.query.mockResolvedValue({
      rows: [{}]
    })
  })
  afterEach(() => {
    pg.clearMocks()
    pg.restoreDefaults()
  })

  it('queries the db', async () => {
    await get('consent-id')
    expect(pg.client.query).toHaveBeenCalled()
  })
})
