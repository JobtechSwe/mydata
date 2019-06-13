const tokens = require('../../lib/services/tokens')
const { JWT, JWK } = require('@panva/jose')
const { sign } = require('../../lib/services/jwt')

describe('tokens', () => {
  it('CONNECTION_EVENT', async () => {
    const token = await tokens.createConnectionEvent('http://mycv.work', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
    expect(token).toEqual(expect.any(String))
  })

  describe('#createLoginEvent', () => {
    it('Happy path', async () => {
      const payload = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      const serviceId = 'http://mycv.work'
      const token = await tokens.createLoginEvent(serviceId, payload)
      expect(token).toEqual(expect.any(String))
    })
  })
  describe('#createConnectionEvent', () => {
    let payloadFromDevice, header, deviceKey, connectionToken
    beforeEach(async () => {
      deviceKey = await JWK.generate('RSA', 1024, {
        kid: 'mydata://account/jwks/account_key',
        use: 'sig'
      })
      payloadFromDevice = {
        type: 'CONNECTION',
        sid: 'f0b5bef5-c137-4211-adaf-a0d6a37be8b1',
        aud: 'https://mycv.work',
        iss: 'mydata://account',
        sub: 'b09b4355-8c95-40a4-a3dd-e176c4baab73'
      }
      header = {
        jwk: deviceKey
      }
      connectionToken = await sign(payloadFromDevice, deviceKey, header)
    })
    it('creates valid connection event token', async () => {
      const token = await tokens.createConnectionEvent(payloadFromDevice.aud, connectionToken)
      const { payload } = JWT.decode(token, { complete: true })
      expect(payload.type).toEqual('CONNECTION_EVENT')
      expect(payload.payload).toEqual(connectionToken)
    })
  })
})
