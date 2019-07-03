const { writePermission } = require('../lib/sqlStatements')
const { write, read } = require('../lib/data')
const { client } = require('../__mocks__/pg')
const pdsAdapter = require('../lib/adapters/pds')

jest.mock('../lib/sqlStatements', () => ({
  writePermission: jest.fn().mockName('sqlStatements.writePermission')
    .mockReturnValue(['sql', []])
}))
jest.mock('../lib/adapters/pds', () => ({
  get: jest.fn().mockName('pdsAdapter.get')
}))

describe('data', () => {
  describe('#write', () => {
    let header, payload, dbResult
    let pds
    let res, next
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
        data: 'Some huge JWE',
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

      pds = {
        outputFile: jest.fn().mockName('pds.outputFile').mockResolvedValue()
      }

      res = {
        sendStatus: jest.fn().mockName('res.sendStatus')
      }
      next = jest.fn().mockName('next')

      client.query.mockImplementation(async () => dbResult)
      pdsAdapter.get.mockReturnValue(pds)
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
      const data = 'Some huge JWE'
      const encoding = 'utf8'

      expect(pds.outputFile).toHaveBeenCalledWith(path, data, encoding)
    })
    it('sends a 200 status on success', async () => {
      await write({ header, payload }, res, next)

      expect(res.sendStatus).toHaveBeenCalledWith(200)
    })
  })
})
