const { createApi, generateKeys, sign } = require('../../helpers')
const app = require('../../../lib/app')
const pg = require('../../../__mocks__/pg')

jest.mock('../../../lib/adapters/pds')

describe('routes /api/accounts', () => {
  let api, accountKeys
  beforeAll(async () => {
    accountKeys = await generateKeys('sig')
  })
  beforeEach(() => {
    api = createApi(app)
  })
  const payload = (data) => ({
    data,
    signature: {
      alg: 'RSA-SHA512',
      kid: 'account_key',
      data: sign('RSA-SHA512', data, accountKeys.privateKey)
    }
  })
  describe('POST: /', () => {
    let account
    beforeEach(() => {
      account = {
        accountKey: Buffer.from(accountKeys.publicKey).toString('base64'),
        pds: {
          provider: 'dropbox',
          access_token: 'some access token'
        }
      }
    })
    it('does not throw if payload is valid', async () => {
      const response = await api.post('/api/accounts', payload(account))

      expect(response.body.details).toBeUndefined()
      expect(response.status).toBeLessThan(300)
    })
    it('creates an account', async () => {
      await api.post('/api/accounts', payload(account))

      expect(pg.client.query).toHaveBeenCalledWith(expect.any(String), [
        expect.any(String), // uuid,
        accountKeys.publicKey,
        account.pds.provider,
        expect.any(Buffer) // pds access_token
      ])
    })
    it('returns a 400 error if payload is bad', async () => {
      account.pds = undefined
      const response = await api.post('/api/accounts', payload(account))

      expect(response.status).toEqual(400)
      expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    })
    it('sets status created if succesful', async () => {
      const response = await api.post('/api/accounts', payload(account))

      expect(response.status).toEqual(201)
    })
    it('returns the new account id if succesful', async () => {
      const response = await api.post('/api/accounts', payload(account))

      expect(response.body.data).toEqual({ id: expect.any(String) })
    })
    it('returns a 500 error if service borks', async () => {
      const error = new Error('b0rk')
      pg.client.query.mockRejectedValue(error)
      const response = await api.post('/api/accounts', payload(account))

      expect(response.status).toEqual(500)
      expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    })
  })
  describe('GET: /:id', () => {
    let accountId, account
    beforeEach(() => {
      accountId = '2982bf9d-cda1-4a2a-ae1b-189cf7f65673'
      account = {
        id: accountId,
        account_key: 'key',
        pds_provider: 'dropbox',
        pds_credentials: Buffer.from('{"apiKey":"key"}')
      }
      pg.client.query.mockResolvedValue({ rows: [account] })
    })
    it('sets status 404 if account was not found', async () => {
      pg.client.query.mockResolvedValue({ rows: [] })
      const response = await api.get(`/api/accounts/${accountId}`)

      expect(response.status).toEqual(404)
      expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    })
    it('sets status 200 if account was found', async () => {
      const response = await api.get(`/api/accounts/${accountId}`)
      expect(response.status).toEqual(200)
    })
    it('returns account if it was found', async () => {
      const response = await api.get(`/api/accounts/${accountId}`)
      expect(response.body).toEqual({
        data: {
          id: accountId,
          accountKey: 'key',
          pds: {
            provider: 'dropbox'
          }
        },
        links: {
          self: `/api/accounts/${accountId}`
        }
      })
    })
    it('returns a 500 if service borks', async () => {
      pg.client.query.mockRejectedValue(new Error('b0rk'))
      const response = await api.get(`/api/accounts/${accountId}`)

      expect(response.status).toEqual(500)
      expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    })
  })
})
