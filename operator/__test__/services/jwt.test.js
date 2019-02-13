const { createToken } = require('../../lib/services/jwt')

describe('services/auth', () => {
  describe('#createToken', () => {
    let payload
    beforeEach(() => {
      payload = {
        foo: '12345',
        bar: 'muu'
      }
    })
    it('creates a token containing account info', () => {
      let content = createToken(payload).split('.')[1]
      content = JSON.parse(Buffer.from(content, 'base64').toString('utf8'))
      expect(content.data).toEqual(payload)
    })
  })
})
