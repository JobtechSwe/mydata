const tokens = require('../../lib/services/tokens')

describe('tokens', () => {
  it('CONNECTION_EVENT', async () => {
    const token = await tokens.createConnectionEvent('http://mycv.work', 'drftyguhjklnbiasdhoiasdhasoidasdsa')
    expect(token).toEqual(expect.any(String))
  })

  describe('#createLoginEvent', () => {
    it('Happy path', async () => {
      const payload = 'fghuijohjiosadasdsad'
      const serviceId = 'http://mycv.work'
      const token = await tokens.createLoginEvent(payload, serviceId)
      expect(token).toEqual(expect.any(String))
    })
  })
})
