const { createAuthenticationUrl } = require('./../lib/auth')

describe('auth', () => {
  describe('createAuthenticationUrl', () => {
    it('prefixes the token with correct protocol / path', () => {
      expect(createAuthenticationUrl('foo')).toEqual('mydata://account/foo')
    })
  })
})
