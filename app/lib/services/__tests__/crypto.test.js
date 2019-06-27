import {
  generateKey,
  toPublicKey,
} from '../crypto'

describe('services/crypto', () => {
  describe('#generateKey', () => {
    it('generates a valid, private jwk', async () => {
      const key = await generateKey({ use: 'enc' })
      expect(key).toEqual({
        d: expect.stringMatching(/^[a-zA-Z0-9_-]*$/),
        dp: expect.stringMatching(/^[a-zA-Z0-9_-]*$/),
        dq: expect.stringMatching(/^[a-zA-Z0-9_-]*$/),
        e: 'AQAB',
        kid: expect.stringMatching(/^egendata:\/\/jwks\/[a-zA-Z0-9_-]*$/),
        kty: 'RSA',
        n: expect.stringMatching(/^[a-zA-Z0-9_-]*$/),
        p: expect.stringMatching(/^[a-zA-Z0-9_-]*$/),
        q: expect.stringMatching(/^[a-zA-Z0-9_-]*$/),
        qi: expect.stringMatching(/^[a-zA-Z0-9_-]*$/),
        use: 'enc',
      })
    })
  })
  describe('#toPublicKey', () => {
    let privateKey
    beforeAll(async () => {
      privateKey = await generateKey({ use: 'enc' })
    })
    it('does not expose the private parts', () => {
      const { d, dp, dq, p, q, qi } = toPublicKey(privateKey)

      expect({ d, dp, dq, p, q, qi }).toEqual({})
    })
    it('returns the public key', () => {
      const publicKey = toPublicKey(privateKey)

      expect(publicKey).toEqual({
        e: 'AQAB',
        kid: expect.stringMatching(/^egendata:\/\/jwks\/[a-zA-Z0-9_-]*$/),
        kty: 'RSA',
        n: expect.stringMatching(/^[a-zA-Z0-9_-]*$/),
        use: 'enc',
      })
    })
  })
})
