const schemas = require('../lib/schemas')
const { JWK } = require('@panva/jose')

function jwk () {
  return JWK.generateSync('RSA', 1024, { use: 'enc' }).toJWK(false)
}

describe('schemas', () => {
  let jwtDefaults
  beforeEach(() => {
    jwtDefaults = {
      aud: 'mydata://account',
      exp: 1234,
      iat: 1233,
      iss: 'https://mycv.work'
    }
  })
  describe('CONNECTION_REQUEST', () => {
    it('validates a correct payload', async () => {
      const payload = {
        ...jwtDefaults,
        type: 'CONNECTION_REQUEST',
        sid: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
        displayName: 'My CV',
        description: 'This is a good CV site',
        iconURI: 'https://cv.work/icon.png',
        permissionRequests: [
          {
            id: '91910133-4024-4641-a7c7-91fb6e11588e',
            domain: 'http://cv.work',
            area: 'education',
            type: 'READ',
            purpose: 'Stuff',
            lawfulBasis: 'CONSENT',
            key: jwk()
          }
        ]
      }
      await expect(schemas.CONNECTION_REQUEST.validate(payload))
        .resolves.not.toThrow()
    })
  })
  describe('CONNECTION', () => {
    let connection
    beforeEach(() => {
      connection = {
        ...jwtDefaults,
        type: 'CONNECTION',
        aud: 'https://mycv.work',
        sid: 'sdkfhdkskdfd',
        sub: 'baa949aa-fbb5-4aad-8351-d6ef219dd07b',
        permissions: [
          {
            id: 'd8f53525-18a8-4819-a7af-847ed456420f',
            domain: 'https://mycv.work',
            area: 'edumacation',
            type: 'READ'
          }
        ]
      }
    })
    it('validates a correct payload', async () => {
      await expect(schemas.CONNECTION.validate(connection))
        .resolves.not.toThrow()
    })
    describe('CONNECTION_RESPONSE', () => {
      it('validates a correct payload', async () => {
        const payload = {
          ...jwtDefaults,
          aud: 'https://smoothoperator',
          type: 'CONNECTION_RESPONSE',
          payload: {
            ...jwtDefaults,
            type: 'CONNECTION',
            aud: 'https://mycv.work',
            sid: 'sdkfhdkskdfd',
            sub: 'baa949aa-fbb5-4aad-8351-d6ef219dd07b',
            permissions: {
              approved: [
                {
                  id: 'd8f53525-18a8-4819-a7af-847ed456420f',
                  domain: 'https://mycv.work',
                  area: 'edumacation',
                  type: 'READ'
                }
              ],
              denied: [
                {
                  id: '647d1fc5-2a5b-405f-bbd9-1b84d58ce5dc',
                  domain: 'https://mycv.work',
                  area: 'diary',
                  type: 'READ'
                }
              ]
            }
          }
        }
        await expect(schemas.CONNECTION_RESPONSE.validate(payload))
          .resolves.not.toThrow()
      })
    })
  })
})
