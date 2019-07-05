const { JWT, JWK } = require('@panva/jose')
const { schemas } = require('@egendata/messaging')
const { sign } = require('../../lib/services/jwt')
const tokens = require('../../lib/services/tokens')

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
      const expectedType = 'CONNECTION_EVENT'

      expect(payload.type).toEqual(expectedType)
      await expect(schemas[expectedType].validate(payload))
        .resolves.not.toThrow()
      expect(payload.payload).toEqual(connectionToken)
    })
  })
  describe('#createDataReadResponse', () => {
    let readDataRequest, data
    beforeEach(async () => {
      readDataRequest = {
        type: 'DATA_READ_REQUEST',
        sub: 'd82054d3-4115-49a0-ac5c-3325273d53b2',
        aud: 'https://smoothoperator.com',
        iss: 'https://mycv.work',
        domain: 'https://mycv.work',
        area: 'favorite_cats',
        iat: 1562323351,
        exp: 1562326951
      }
      data = {
        protected: 'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2In0',
        recipients: [
          {
            header: {
              kid: 'http://localhost:64172/jwks/dQSdk8GhZeM4-IjSI0gkln7Mg0SG1vpOscOLZk65Iyw',
              alg: 'RSA-OAEP'
            },
            encrypted_key: 'IjEIBdvEeNMAln6U0armHyfW-G8XYiSmcNVcIu8GBCyXNUt0rkbIQysncSATPa9etuuqQnvvsBYqEjXyllm26FNXJSZIaOOf7y1Nh_JlSnrqxEmnRW75D2I0d58yiB8meiuHbOWzRyyaOU1iyZ_Gw5y0ILiBQxIkVnM78KQuo_phk6hQo3wzXU4-IiC4p3Jypo-v5S8qlAlE-rk-1ykH0gj--ZdPYajLo-nE6nuB5bM0HOR8yL1R-57Gs2BBHh7CgSlUAkOLni7xtiKdL9vJZfeQ9NTJWqnhM9MX65JSsgMeTllMirALjoNvY35w0OGb8F7q29P23Co4MMs72iysWw'
          },
          {
            header: {
              kid: 'egendata://jwks/rhQX3s5x9y398fcmAaexW7u22dl-t2na2sCnqyDVCOU',
              alg: 'RSA-OAEP'
            },
            encrypted_key: 'ncitnvyG6-LAqZ91qjb3aBWlUIU9CylR9W4LztLzvMSOGxneX__yhsPBB-S5jdeEdCYmgSxdEVT-PKCvoKM7Sqht2HRdXPJ-aEmUWhyFHzDKQ4AIjQUgTPyl8a9WKG9ncO5ZO9s6bKw1wRJph7mKKFb46t8CDLJOjghNRuOSorXCaAF9ekxFI1hAOFFOjcVnmVGTSVwtkTNzglMvG907IfIyqKD3mBvDfp7QLUKXV4AV_TIQ6j9vsD4moagdGCBlKT0YKraLMJChc2u-Mq7Bwxd9w2y-26W7G3aEDwvowp9kWmj9ZkKzJunL0KMEyXgny5cmfjqK68vjj87P3vpDmw'
          }
        ],
        iv: 'CHIJCMomkqr-R7gxmXQ7RA',
        ciphertext: 'Fj3b5Y3Zu_cKQUqos8xkrh0DIx73f-UYWOu9Dv5NfAHcJnaa_zYqb1Cbuian5oVm0632UuMHf9jng2xBZOZ6qfdWtID15dYwP8tSMizLU6_Qrt8tZCJI1nBDJ7hEUAqBPOde9bZSH8_uwSEsOKLoGHzVLXT3IIHsLo1ua1yBdFBjQJDPdBTpcJxgoZvOhQ3t5ftgAY7zgMpAfCZEwpbXSpOIo8ND5LxmDiPZV4AknyM3vDiWkKwiGzkiGCqB4d8C-8KOEz69HCocvYkfVUSpjCCWKsFc0txDcLnOwQp11oeINWU0RE3Ws2qxukoMN-DlcUZOgHh9AHbALNWfuu_8riqh6I2FXDVEnXJ1N7swzvkNo_TcXF8_Nj2_cIeST6u2',
        tag: 'TiBled05Q4fysMyy72-z-g'
      }
    })
    it('creates valid empty DATA_READ_RESPONSE token', async () => {
      const token = await tokens.createDataReadResponse(readDataRequest)
      const { payload } = JWT.decode(token, { complete: true })
      const expectedType = 'DATA_READ_RESPONSE'

      expect(payload.type).toEqual(expectedType)
      await expect(schemas[expectedType].validate(payload))
        .resolves.not.toThrow()
    })
    it('creates valid DATA_READ_RESPONSE token with data', async () => {
      const token = await tokens.createDataReadResponse(readDataRequest, data)
      const { payload } = JWT.decode(token, { complete: true })
      const expectedType = 'DATA_READ_RESPONSE'

      expect(payload.type).toEqual(expectedType)
      await expect(schemas[expectedType].validate(payload))
        .resolves.not.toThrow()
      expect(payload.data).toEqual(data)
    })
  })
})
