const { createApi, generateKeys, sign } = require('../../helpers')
const app = require('../../../lib/app')

jest.mock('../../../lib/services/accounts')
const accountService = require('../../../lib/services/accounts')
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
      accountService.create.mockClear()
      account = {
        accountKey: Buffer.from(accountKeys.publicKey).toString('base64'),
        pds: {
          provider: 'dropbox',
          access_token: 'some access token'
        }
      }
    })
    it('returns a 400 error if service throws ValidationError', async () => {
      accountService.create.mockImplementation(() => {
        const error = new Error('b0rk')
        error.name = 'ValidationError'
        throw error
      })
      const response = await api.post('/api/accounts', payload(account))

      expect(response.status).toEqual(400)
      expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    })
    it('sets status created if successful', async () => {
      accountService.create.mockResolvedValue({ id: '1212' })
      const response = await api.post('/api/accounts', payload(account))

      expect(response.status).toEqual(201)
    })
    it('returns the new account id if successful', async () => {
      accountService.create.mockResolvedValue({ id: '1212' })
      const response = await api.post('/api/accounts', payload(account))

      expect(response.body.data).toEqual({ id: expect.any(String) })
    })
    it('returns a 500 error if service borks', async () => {
      accountService.create.mockImplementation(() => {
        throw new Error('b0rk')
      })
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
        accountKey: 'key',
        pdsProvider: 'dropbox',
        pdsCredentials: Buffer.from('{"apiKey":"key"}')
      }
    })
    it('sets status 404 if account was not found', async () => {
      accountService.get.mockResolvedValue(undefined)
      const response = await api.get(`/api/accounts/${accountId}`)

      expect(response.status).toEqual(404)
      expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    })
    it('sets status 200 if account was found', async () => {
      accountService.get.mockResolvedValue(account)
      const response = await api.get(`/api/accounts/${accountId}`)
      expect(response.status).toEqual(200)
    })
    it('returns account if it was found', async () => {
      accountService.get.mockResolvedValue(account)
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
      accountService.get.mockRejectedValue(new Error('lp0 on fire'))
      const response = await api.get(`/api/accounts/${accountId}`)

      expect(response.status).toEqual(500)
      expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    })
  })
  describe('POST: /:id/login', () => {
    beforeEach(() => {
      accountService.login.mockClear()
    })

    const loginRequest = {
      timestamp: '1551373858751',
      clientId: 'https://cv.tld',
      sessionId: '84845151884',
      consentId: '2b2a759e-8fac-49d0-a9d0-3ca9e7cb8e22'
    }
    const accountId = '31337'

    it('returns 200 when service resolves', async () => {
      const response = await api.post('/api/accounts/1337/login', loginRequest)
      expect(response.status).toBe(200)
    })

    it('returns 400 when service throws validation error', async () => {
      accountService.login.mockImplementation(() => {
        const error = new Error('Your data is wrong!')
        error.name = 'ValidationError'
        throw error
      })

      const response = await api.post('/api/accounts/1337/login', loginRequest)
      expect(response.status).toBe(400)
    })

    it('returns 500 when service throws non-validation error', async () => {
      accountService.login.mockImplementation(() => {
        const error = new Error('lp0 on fire')
        throw error
      })

      const response = await api.post('/api/accounts/1337/login', loginRequest)
      expect(response.status).toBe(500)
    })

    it('calls the login service accountId and login data', async () => {
      await api.post(`/api/accounts/${accountId}/login`, loginRequest)
      expect(accountService.login).toHaveBeenCalledWith(accountId, loginRequest)
    })
  })
})
