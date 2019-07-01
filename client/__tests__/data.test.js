const axios = require('axios')
const data = require('../lib/data')

jest.mock('axios', () => ({
  post: jest.fn().mockName('axios.post').mockResolvedValue({})
}))

describe('data', () => {
  let config, keyProvider
  let connectionId, domain, area, payload
  let read, write
  beforeEach(() => {
    config = {
      clientId: 'https://mycv.work',
      operator: 'https://smoothoperator.com'
    }
    keyProvider = {}
    ;({ read, write } = data({ config, keyProvider }))

    connectionId = 'd52da47c-8895-4db8-ae04-7434f21fd118'
    domain = 'https://somotherdomain.org'
    area = 'edumacation'
    payload = ['some', 'stuff']
  })
  describe('#write', () => {
    it('posts to operator', async () => {
      await write(connectionId, { domain, area, data: payload })

      expect(axios.post).toHaveBeenCalledWith(
        'https://smoothoperator.com/api',
        expect.any(Object)
      )
    })
  })
})
