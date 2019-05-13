const { JWT, JWK } = require('@panva/jose')
const { sign, registrationEvent } = require('../../lib/services/jwt')

describe('services/jwt', () => {
  describe('#registrationEvent', () => {
    let operatorKey, deviceKey, registrationToken
    beforeEach(async () => {
      operatorKey = await JWK.generate('RSA', 1024, {
        kid: 'https://smooth_operator.org/jwks/master_key',
        use: 'sig'
      })
      deviceKey = await JWK.generate('RSA', 1024, {
        kid: 'mydata://account/jwks/account_key',
        use: 'sig'
      })
      const payload = {
        type: 'REGISTRATION',
        jti: 'f0b5bef5-c137-4211-adaf-a0d6a37be8b1',
        aud: 'https://mycv.work',
        permissions: []
      }
      const options = {
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
      const token = await registrationEvent(registrationToken, operatorKey)
      const { payload } = JWT.decode(token, { complete: true })
      expect(payload.type).toEqual('REGISTRATION_EVENT')
      expect(payload.payload).toEqual(registrationToken)
    })
  })
})
