const { create, get } = require('../../lib/services/accounts')
const pg = require('../../__mocks__/pg')
jest.mock('../../lib/adapters/redis')

describe('services/accounts', () => {
  afterEach(() => {
    pg.clearMocks()
    pg.restoreDefaults()
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
})
