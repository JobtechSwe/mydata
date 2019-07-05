const { JWT } = require('@panva/jose')
const { schemas } = require('@egendata/messaging')
const { writePermission, readPermission } = require('../lib/sqlStatements')
const { write, read } = require('../lib/data')
const { client } = require('../__mocks__/pg')
const pdsAdapter = require('../lib/adapters/pds')

jest.mock('../lib/sqlStatements', () => ({
  writePermission: jest.fn().mockName('sqlStatements.writePermission')
    .mockReturnValue(['sql', []]),
  readPermission: jest.fn().mockName('sqlStatements.readPermission')
    .mockReturnValue(['sql', []])
}))
jest.mock('../lib/adapters/pds', () => ({
  get: jest.fn().mockName('pdsAdapter.get')
}))

describe('data', () => {
  let header, payload, dbResult
  let pds
  let res, next
  beforeEach(() => {
    pds = {
      outputFile: jest.fn().mockName('pds.outputFile').mockResolvedValue(),
      readFile: jest.fn().mockName('pds.readFile').mockResolvedValue()
    }
    pdsAdapter.get.mockReturnValue(pds)

    res = {
      set: jest.fn().mockName('res.set'),
      status: jest.fn().mockName('res.status'),
      send: jest.fn().mockName('res.send'),
      sendStatus: jest.fn().mockName('res.sendStatus')
    }
    res.set.mockReturnValue(res)
    res.status.mockReturnValue(res)
    next = jest.fn().mockName('next')
  })
  describe('#write', () => {
    beforeEach(() => {
      header = {
        kid: 'https://mycv.work/jwks/client_key',
        alg: 'RS256',
        jwk: {
          e: 'AQAB',
          kid: 'https://mycv.work/jwks/client_key',
          kty: 'RSA',
          n: 'xyreBBPlmmgOvvcbketCmy-4H5-yBCp0q18gzmQksHuaag5TDGgP5sYiu8L5sgcGa1AT5K51iMu1g6MRfceeg_DagTv7M2EiVEU4EHZoaUyjNbOywmqp-EC8N2RkZ5LxJ8mOjVWOjPED6JBWOMyZTb5afDVnRxjWnf45lyGSo6c',
          use: 'sig'
        }
      }
      payload = {
        type: 'DATA_WRITE',
        sub: '26eb214f-287b-4def-943c-55a6eefa2d91',
        aud: 'https://smoothoperator.com',
        iss: 'https://mycv.work',
        domain: 'https://mycv.work',
        area: 'favorite_cats',
        data: { txt: 'Some huge JWE' },
        iat: 1562150432,
        exp: 1562154032
      }
      dbResult = {
        rows: [
          {
            pds_provider: 'memory',
            pds_credentials: 'nope',
            domain: 'https://mycv.work',
            area: 'favorite_cats'
          }
        ]
      }

      client.query.mockImplementation(async () => dbResult)
    })
    it('calls sqlStatements.writePermission with the correct arguments', async () => {
      await write({ header, payload }, res, next)

      expect(writePermission).toHaveBeenCalledWith({
        connectionId: '26eb214f-287b-4def-943c-55a6eefa2d91',
        domain: 'https://mycv.work',
        area: 'favorite_cats',
        serviceId: 'https://mycv.work'
      })
    })
    it('gets the correct PDS adapter', async () => {
      await write({ header, payload }, res, next)

      expect(pdsAdapter.get).toHaveBeenCalledWith({
        pdsProvider: 'memory',
        pdsCredentials: 'nope'
      })
    })
    it('outputs to the correct file', async () => {
      await write({ header, payload }, res, next)

      const dir =
        '/data/26eb214f-287b-4def-943c-55a6eefa2d91/https%3A%2F%2Fmycv.work/favorite_cats'
      const filename = 'data.json'
      const path = `${dir}/${filename}`
      const data = '{"txt":"Some huge JWE"}'
      const encoding = 'utf8'

      expect(pds.outputFile).toHaveBeenCalledWith(path, data, encoding)
    })
    it('sends a 200 status on success', async () => {
      await write({ header, payload }, res, next)

      expect(res.sendStatus).toHaveBeenCalledWith(200)
    })
  })
  describe('#read', () => {
    beforeEach(() => {
      header = {
        kid: 'https://mycv.work/jwks/client_key',
        alg: 'RS256',
        jwk: {
          e: 'AQAB',
          kid: 'https://mycv.work/jwks/client_key',
          kty: 'RSA',
          n: 'xyreBBPlmmgOvvcbketCmy-4H5-yBCp0q18gzmQksHuaag5TDGgP5sYiu8L5sgcGa1AT5K51iMu1g6MRfceeg_DagTv7M2EiVEU4EHZoaUyjNbOywmqp-EC8N2RkZ5LxJ8mOjVWOjPED6JBWOMyZTb5afDVnRxjWnf45lyGSo6c',
          use: 'sig'
        }
      }
      payload = {
        type: 'DATA_READ_REQUEST',
        sub: 'd82054d3-4115-49a0-ac5c-3325273d53b2',
        aud: 'https://smoothoperator.com',
        iss: 'https://mycv.work',
        domain: 'https://mycv.work',
        area: 'favorite_cats',
        iat: 1562323351,
        exp: 1562326951
      }
      dbResult = {
        rows: [
          {
            pds_provider: 'memory',
            pds_credentials: 'nope',
            domain: 'https://mycv.work',
            area: 'favorite_cats'
          }
        ]
      }

      client.query.mockImplementation(async () => dbResult)
    })
    describe('with data', () => {
      let data
      beforeEach(() => {
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
        pds.readFile.mockResolvedValue(JSON.stringify(data))
      })
      it('calls sqlStatements.readPermission with the correct arguments', async () => {
        await read({ header, payload }, res, next)

        expect(readPermission).toHaveBeenCalledWith({
          connectionId: 'd82054d3-4115-49a0-ac5c-3325273d53b2',
          domain: 'https://mycv.work',
          area: 'favorite_cats',
          serviceId: 'https://mycv.work'
        })
      })
      it('gets the correct PDS adapter', async () => {
        await read({ header, payload }, res, next)

        expect(pdsAdapter.get).toHaveBeenCalledWith({
          pdsProvider: 'memory',
          pdsCredentials: 'nope'
        })
      })
      it('reads the correct file', async () => {
        await read({ header, payload }, res, next)

        const dir =
          '/data/d82054d3-4115-49a0-ac5c-3325273d53b2/https%3A%2F%2Fmycv.work/favorite_cats'
        const filename = 'data.json'
        const path = `${dir}/${filename}`
        const encoding = 'utf8'

        expect(pds.readFile).toHaveBeenCalledWith(path, encoding)
      })
      it('sends a DATA_READ_RESPONSE payload on success', async () => {
        await read({ header, payload }, res, next)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/jwt')
        expect(res.send).toHaveBeenCalledWith(expect.any(String))
      })
      it('sends a valid DATA_READ_RESPONSE token on success', async () => {
        await read({ header, payload }, res, next)

        const [token] = res.send.mock.calls[0]
        const claimsSet = JWT.decode(token)
        const expectedType = 'DATA_READ_RESPONSE'

        expect(claimsSet.type).toEqual(expectedType)
        await expect(schemas[expectedType].validate(claimsSet))
          .resolves.not.toThrow()
      })
    })
    describe('without data', () => {
      it('calls sqlStatements.readPermission with the correct arguments', async () => {
        await read({ header, payload }, res, next)

        expect(readPermission).toHaveBeenCalledWith({
          connectionId: 'd82054d3-4115-49a0-ac5c-3325273d53b2',
          domain: 'https://mycv.work',
          area: 'favorite_cats',
          serviceId: 'https://mycv.work'
        })
      })
      it('gets the correct PDS adapter', async () => {
        await read({ header, payload }, res, next)

        expect(pdsAdapter.get).toHaveBeenCalledWith({
          pdsProvider: 'memory',
          pdsCredentials: 'nope'
        })
      })
      it('reads the correct file', async () => {
        await read({ header, payload }, res, next)

        const dir =
          '/data/d82054d3-4115-49a0-ac5c-3325273d53b2/https%3A%2F%2Fmycv.work/favorite_cats'
        const filename = 'data.json'
        const path = `${dir}/${filename}`
        const encoding = 'utf8'

        expect(pds.readFile).toHaveBeenCalledWith(path, encoding)
      })
      it('sends a DATA_READ_RESPONSE payload on success', async () => {
        await read({ header, payload }, res, next)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/jwt')
        expect(res.send).toHaveBeenCalledWith(expect.any(String))
      })
      it('sends a valid DATA_READ_RESPONSE token on success', async () => {
        await read({ header, payload }, res, next)

        const [token] = res.send.mock.calls[0]
        const claimsSet = JWT.decode(token)
        const expectedType = 'DATA_READ_RESPONSE'

        expect(claimsSet.type).toEqual(expectedType)
        await expect(schemas[expectedType].validate(claimsSet))
          .resolves.not.toThrow()
      })
    })
  })
})
