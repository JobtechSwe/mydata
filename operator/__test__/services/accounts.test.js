const { create, get, login } = require('../../lib/services/accounts')
const pg = require('../../__mocks__/pg')
jest.mock('../../lib/adapters/redis')

jest.mock('../../lib/services/clients')
const { sendEventLoginApproved } = require('../../lib/services/clients')

describe('services/accounts', () => {
  afterEach(() => {
    pg.clearMocks()
  })
  describe('#create', () => {
    let account
    beforeEach(() => {
      account = {
        firstName: 'Einar',
        lastName: 'Persson',
        accountKey: Buffer.from('-----BEGIN RSA PUBLIC KEY----- ...').toString('base64'),
        pds: {
          provider: 'dropbox',
          access_token: 'asdasdasd'
        }
      }
    })
    it('fails if the input is invalid', async () => {
      await expect(create({})).rejects.toThrow()
    })
    it('calls query', async () => {
      await create(account)
      expect(pg.client.query).toHaveBeenCalled()
    })
    it('saves to db with correct parameters', async () => {
      await create(account)
      expect(pg.client.query).toHaveBeenCalledWith(expect.any(String), [
        expect.any(String), // uuid
        '-----BEGIN RSA PUBLIC KEY----- ...', // public key
        account.pds.provider,
        expect.any(Buffer)
      ])
    })
    it('returns the account id', async () => {
      const result = await create(account)
      expect(result).toEqual({
        id: expect.any(String)
      })
    })
  })
  describe('#get', () => {
    let accountId, pdsCredentials
    beforeEach(() => {
      accountId = '2982bf9d-cda1-4a2a-ae1b-189cf7f65673'
      pdsCredentials = {
        apiKey: 'foo'
      }
      pg.client.query.mockResolvedValue({
        rows: [{
          id: accountId,
          pds_credentials: Buffer.from(JSON.stringify(pdsCredentials))
        }]
      })
    })
    it('fails if the input is invalid', async () => {
      await expect(get()).rejects.toThrow()
    })
    it('gets from postgres by id', async () => {
      await get(accountId)
      expect(pg.client.query).toHaveBeenCalledWith(expect.any(String), [accountId])
    })
    it('returns the account', async () => {
      const result = await get(accountId)
      expect(result).toEqual({ id: accountId, pdsCredentials })
    })
  })
  describe('#login', () => {
    beforeEach(() => {
      pg.client.query.mockResolvedValue({
        rows: [{
          count: 1
        }]
      })
    })
    const validAccountId = '22d2b385-d69e-4a46-b983-718a470ab302'
    const validData = {
      timestamp: '1551373858751',
      clientId: 'https://cv.tld',
      sessionId: '84845151884',
      consentId: '2b2a759e-8fac-49d0-a9d0-3ca9e7cb8e22'
    }

    it('throws if input is invalid', async () => {
      await expect(login()).rejects.toThrow()
      await expect(login(validAccountId, {})).rejects.toThrow()
      await expect(login('', validData)).rejects.toThrow()
    })

    it('does not throw if input is valid', async () => {
      await login(validAccountId, validData)
    })

    it('checks that consent belongs to user', async () => {
      await login(validAccountId, validData)
      expect(pg.client.query).toHaveBeenCalledWith(expect.any(String), [validAccountId, validData.consentId])
    })

    it('throws if consent does not belong to user', async () => {
      pg.client.query.mockResolvedValueOnce({
        rows: [{
          count: '0'
        }]
      })
      await expect(login(validAccountId, validData)).rejects.toThrowError(new Error('Consent does not belong to user'))
    })

    it('calls client service to send login approval', async () => {
      const accessToken = 'TODO: generate this'
      await login(validAccountId, validData)
      expect(sendEventLoginApproved).toHaveBeenCalledWith(validData, accessToken)
    })
  })
})
