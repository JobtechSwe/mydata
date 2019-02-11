const { createRequest } = require('../../../lib/services/consents')
const redis = require('../../../lib/adapters/redis')
const postgres = require('../../../lib/adapters/postgres')
jest.mock('../../../lib/adapters/redis')
jest.mock('../../../lib/adapters/postgres')

describe.skip('services/consents #createRequest', () => {
  let connection
  beforeEach(() => {
    redis.set.mockResolvedValue('OK')
    connection = {
      query: jest.fn().mockResolvedValue({ rows: [{}] }),
      end: jest.fn().mockResolvedValue()
    }
    postgres.connect.mockResolvedValue(connection)
  })

  it('fails if the input is invalid', async () => {
    await expect(createRequest({})).rejects.toThrow()
  })
  it('calls redis.set', async () => {
    await createRequest({
      clientId: 'http://mycv.com',
      scope: ['foo', 'bar']
    })

    expect(redis.set).toHaveBeenCalledTimes(1)
  })
  it('retries with new random id', async () => {
    redis.set.mockResolvedValueOnce('not-OK')

    await createRequest({
      clientId: 'http://mycv.com',
      scope: ['foo', 'bar']
    })

    expect(redis.set).toHaveBeenCalledTimes(2)
    expect(redis.set.mock.calls[0][0]).not.toBe(redis.set.mock.calls[0][1])
  })
})
