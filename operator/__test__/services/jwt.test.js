const { JWT, JWK } = require('@panva/jose')
const {
  registrationEventToken,
  sign
} = require('../../lib/services/jwt')

describe('services/jwt', () => {
  describe('#registrationEventToken', () => {
    let payload, options, deviceKey, registrationToken
    beforeEach(async () => {
      deviceKey = await JWK.generate('RSA', 1024, {
        kid: 'mydata://account/jwks/account_key',
        use: 'sig'
      })
      payload = {
        type: 'REGISTRATION',
        jti: 'f0b5bef5-c137-4211-adaf-a0d6a37be8b1',
        aud: 'https://mycv.work',
        permissions: []
      }
      options = {
        kid: false,
        issuer: 'mydata://account',
        audience: ['https://smooth_operator.org', 'https://mycv.work'],
        subject: 'b09b4355-8c95-40a4-a3dd-e176c4baab73',
        header: { jwk: deviceKey },
        algorithm: 'RS256'
      }
      registrationToken = await sign(payload, deviceKey, options)
    })
    it('creates valid registration event token', async () => {
      const token = await registrationEventToken(options.audience[1], registrationToken)
      const { payload } = JWT.decode(token, { complete: true })
      expect(payload.type).toEqual('REGISTRATION_EVENT')
      expect(payload.payload).toEqual(registrationToken)
    })
  })
})
