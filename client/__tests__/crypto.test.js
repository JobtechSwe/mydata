const crypto = require('../lib/crypto')
const { schemas } = require('@egendata/messaging')

describe('crypto', () => {
  const jwksURI = 'http://localhost:4000/jwks'
  describe('#generateKey', () => {
    it('generates valid public key', async () => {
      const key = await crypto.generateKey(jwksURI, { use: 'enc' }, 1024)

      await schemas.JWK.validate(crypto.toPublicKey(key))
    })
    it('generates valid private key', async () => {
      const key = await crypto.generateKey(jwksURI, { use: 'enc' }, 1024)
      await schemas.JWK_PRIVATE.validate(key)
    })
    it('throws if use is missing', async () => {
      return expect(crypto.generateKey('http://localhost:4000/jwks', {}, 1024))
        .rejects.toThrow(Error)
    })
    it('correctly names enc key as absolute url', async () => {
      const key = await crypto.generateKey(jwksURI, { use: 'enc' }, 1024)
      expect(key.kid).toEqual(expect.stringMatching(new RegExp(`^${jwksURI}/`)))
    })
  })
  describe('#importPEM', () => {
    let pem
    beforeEach(() => {
      pem = '-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQDIp5d0w4c8v4Wa/tma1DML3hvtXmsLB6sVFzrHagESn7AR00WB\nT6/hln3/YjXs1OcgQTkbXP41Zz8LaP5QYZ9voywrXD7iuaHfABHolhiW3y9p6fD9\nP6oNDvNKoS6zFOO7rqBHU3vZm5wfAPjeDqwtloTwY983fcgKdcyzTzpOjQIDAQAB\nAoGBALGfGYV1KJvv9jdUbhCO03kn7pTbReqHqTyMSa4I+lYgId5FpXtorQsHCxYt\nPAsgFFELK6A7W5SuhrJ1CNri8Bxzh/7gYyj7njBTsjNfuoiK3cIkZBoTvY9K/OB+\nzinNKibWf3SZv9l1qFkaJvaC/+R5DMLb9RXUiWJbhOHqTThJAkEA5i5IOpmUmDl1\nHkYaf1cHbmCdnuQHI1YTlANAk/QsAdzfExK6tsTgIqSq5qd+Q38xtZJQrTvTT6p7\nJX+WQflunwJBAN8pdOrdr1tr1o8m958uLs33zjLk75ScnL+tqlCFEtZTVZWIXScB\n9YVZff5yYONfkuDK0kw631UMSxSA14vL71MCQQCbb+WWrN+LbEGKkAyUsVBzWQsX\noSSw2A+ghBG318tf9qctWhh8E7bHris6VyEMs3f+BTA1y5CG27kNOXteUfJBAkEA\n2QQDwvLaONlhycxnOdE7iujVCQFBSxASDwTff3Ypn2ti6wu1Kt3o2UjyEaNBPVwQ\nBbK3V5JY5OgTi1jQRA6KKQJAQiTQR1sA2xiUhYwF6K4hnojGW1Ew0ZBLND+APkej\nufcVAF5yh+ACYQPUMrgNwgcHFshCEJ9cpePZMotVy7zSFQ==\n-----END RSA PRIVATE KEY-----\n'
    })
    it('creates a valid jwk', () => {
      const jwk = crypto.importPEM(pem, jwksURI, { use: 'sig' })
      expect(jwk).toEqual({
        kid: expect.stringMatching(/^http:\/\/localhost:4000\/jwks\//),
        kty: 'RSA',
        use: 'sig',
        e: 'AQAB',
        n: expect.any(String),
        d: expect.any(String),
        p: expect.any(String),
        dp: expect.any(String),
        q: expect.any(String),
        dq: expect.any(String),
        qi: expect.any(String)
      })
    })
    it('throws if jwksURI is missing', () => {
      expect(() => crypto.importPEM(pem, null, { use: 'sig' })).toThrow()
    })
    it('throws if options is missing', () => {
      expect(() => crypto.importPEM(pem, jwksURI)).toThrow()
    })
    it('throws if { use } is missing', () => {
      expect(() => crypto.importPEM(pem, jwksURI, {})).toThrow()
    })
  })
})
