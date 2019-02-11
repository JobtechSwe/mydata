const { getRequest } = require('../../../lib/services/consents')
const redis = require('../../../lib/adapters/redis')
const postgres = require('../../../lib/adapters/postgres')
jest.mock('../../../lib/adapters/redis')
jest.mock('../../../lib/adapters/postgres')

describe.skip('services/consents #getRequest', () => {
  let connection
  beforeEach(() => {
    redis.set.mockResolvedValue('OK')
    connection = {
      query: jest.fn().mockResolvedValue({ rows: [{}] }),
      end: jest.fn().mockResolvedValue()
    }
    postgres.connect.mockResolvedValue(connection)
  })

  it('returns an object', async () => {
    redis.get.mockResolvedValue('{"clientId":"http://cv.work","scope":["loveletters"]}')

    const result = await getRequest('5678')

    expect(result).toEqual({
      client: {},
      request: {
        clientId: 'http://cv.work',
        scope: ['loveletters']
      }
    })
  })
})
