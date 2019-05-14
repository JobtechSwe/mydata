const schemas = require('../lib/schemas')
const { JWK } = require('@panva/jose')

function jwk() {
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
        jti: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
        permissions: {
          local: {
            education: {
              read: {
                id: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
                purpose: 'Stuff',
                lawfulBasis: 'CONSENT',
                jwk: jwk()
              },
              write: {
                id: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
                description: 'Info',
                lawfulBasis: 'CONSENT'
              }
            }
          },
          external: {
            'https://monster.se': {
              experience: {
                read: {
                  id: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
                  purpose: 'Good stuff',
                  jwk: jwk(),
                  lawfulBasis: 'CONSENT'
                }
              }
            }
          }
        }
      }
      await expect(schemas.CONNECTION_REQUEST.validate(payload))
        .resolves.not.toThrow()
    })
  })
  describe('CONNECTION', () => {
    it('validates a correct payload', async () => {
      const payload = {
        ...jwtDefaults,
        aud: ['https://smoothoperator', 'https://mycv.work'],
        sub: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
        type: 'CONNECTION',
        jti: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
        permissions: {
          local: {
            education: {
              read: {
                id: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
                purpose: 'Stuff',
                lawfulBasis: 'CONSENT',
                jwks: [jwk(), jwk()]
              },
              write: {
                id: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
                description: 'Info',
                lawfulBasis: 'CONSENT'
              }
            }
          },
          external: {
            'https://monster.se': {
              experience: {
                read: {
                  id: 'ccec677d-09d1-489a-a3da-e4758134f2fa',
                  purpose: 'Good stuff',
                  jwks: [jwk(), jwk()],
                  lawfulBasis: 'CONSENT'
                }
              }
            }
          }
        }
      }
      await expect(schemas.CONNECTION.validate(payload))
        .resolves.not.toThrow()
    })
  })
})
