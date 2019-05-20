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
        permissions: [
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
    it('validates a correct payload', async () => {
      const payload = {
        ...jwtDefaults,
        aud: 'https://smoothoperator',
        type: 'CONNECTION',
        content: [
          {
            domain: 'https://mycv.work',
            area: 'education',
            data: {
              recipients: [
                {
                  encrypted_key: 'laLxI0j-nLH-_BgLOXMozKxmy9gffy2gTdvqzfTihJBuuzxg0V7yk1WClnQePFvG2K-pvSlWc9BRIazDrn50RcRai__3TDON395H3c62tIouJJ4XaRvYHFjZTZ2GXfz8YAImcc91Tfk0WXC2F5Xbb71ClQ1DDH151tlpH77f2ff7xiSxh9oSewYrcGTSLUeeCt36r1Kt3OSj7EyBQXoZlN7IxbyhMAfgIe7Mv1rOTOI5I8NQqeXXW8VlzNmoxaGMny3YnGir5Wf6Qt2nBq4qDaPdnaAuuGUGEecelIO1wx1BpyIfgvfjOhMBs9M8XL223Fg47xlGsMXdfuY-4jaqVw',
                  header: {
                    alg: 'RSA1_5',
                    kid: 'https://mycv.work/jwks/dfh54g5f4d4',
                    jwk: jwk()
                  }
                },
                {
                  encrypted_key: 'laLxI0j-nLH-_BgLOXMozKxmy9gffy2gTdvqzfTihJBuuzxg0V7yk1WClnQePFvG2K-pvSlWc9BRIazDrn50RcRai__3TDON395H3c62tIouJJ4XaRvYHFjZTZ2GXfz8YAImcc91Tfk0WXC2F5Xbb71ClQ1DDH151tlpH77f2ff7xiSxh9oSewYrcGTSLUeeCt36r1Kt3OSj7EyBQXoZlN7IxbyhMAfgIe7Mv1rOTOI5I8NQqeXXW8VlzNmoxaGMny3YnGir5Wf6Qt2nBq4qDaPdnaAuuGUGEecelIO1wx1BpyIfgvfjOhMBs9M8XL223Fg47xlGsMXdfuY-4jaqVw',
                  header: {
                    alg: 'RSA1_5',
                    kid: 'mydata://jwks/ulgulgulg',
                    jwk: jwk()
                  }
                }
              ],
              protected: 'dsggff',
              iv: 'bbd5sTkYwhAIqfHsx8DayA',
              ciphertext: '0fys_TY_na7f8dwSfXLiYdHaA2DxUjD67ieF7fcVbIR62JhJvGZ4_FNVSiGc_raa0HnLQ6s1P2sv3Xzl1p1l_o5wR_RsSzrS8Z-wnI3Jvo0mkpEEnlDmZvDu_k8OWzJv7eZVEqiWKdyVzFhPpiyQU28GLOpRc2VbVbK4dQKPdNTjPPEmRqcaGeTWZVyeSUvf5k59yJZxRuSvWFf6KrNtmRdZ8R4mDOjHSrM_s8uwIFcqt4r5GX8TKaI0zT5CbL5Qlw3sRc7u_hg0yKVOiRytEAEs3vZkcfLkP6nbXdC_PkMdNS-ohP78T2O6_7uInMGhFeX4ctHG7VelHGiT93JfWDEQi5_V9UN1rhXNrYu-0fVMkZAKX3VWi7lzA6BP430m',
              tag: 'kvKuFBXHe5mQr4lqgobAUg'
            }
          }
        ]
      }
      await expect(schemas.CONNECTION.validate(payload))
        .resolves.not.toThrow()
    })
  })
})
