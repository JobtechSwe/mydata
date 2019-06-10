const schemas = require('../lib/schemas')
const { JWK } = require('@panva/jose')

function jwk (domain) {
  const key = JWK.generateSync('RSA', 1024, { use: 'enc' }).toJWK(false)
  key.kid = `${domain}/jwks/${key.kid}`
  return key
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
        permissions: [
          // Read permission request
          {
            id: '91910133-4024-4641-a7c7-91fb6e11588e',
            domain: 'http://cv.work',
            area: 'education',
            type: 'READ',
            purpose: 'Stuff',
            lawfulBasis: 'CONSENT',
            jwk: jwk('http://cv.work')
          },
          // Write permission request
          {
            id: '392c6472-40e4-4e2b-92e2-77a46c1900b8',
            domain: 'http://cv.work',
            area: 'education',
            type: 'WRITE',
            description: 'Stuff',
            lawfulBasis: 'CONSENT'
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
        permissions: {
          approved: [
            {
              id: '91910133-4024-4641-a7c7-91fb6e11588e',
              domain: 'https://mycv.work',
              area: 'edumacation',
              type: 'READ',
              purpose: 'Stuff',
              lawfulBasis: 'CONSENT',
              kid: jwk('http://cv.work').kid
            },
            {
              id: '392c6472-40e4-4e2b-92e2-77a46c1900b8',
              domain: 'https://mycv.work',
              area: 'edumacation',
              type: 'WRITE',
              description: 'Stuff',
              lawfulBasis: 'CONSENT',
              jwks: {
                keys: [
                  jwk('mydata://account/baa949aa-fbb5-4aad-8351-d6ef219dd07b'),
                  jwk('http://cv.work')
                ]
              }
            }
          ]
        }
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
          payload: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dnZWRJbkFzIjoiYWRtaW4iLCJpYXQiOjE0MjI3Nzk2Mzh9.gzSraSYS8EXBxLN_oWnFSRgCzcmJmMjLiuyu5CSpyHI'
        }
        await expect(schemas.CONNECTION_RESPONSE.validate(payload))
          .resolves.not.toThrow()
      })
    })
  })
})
