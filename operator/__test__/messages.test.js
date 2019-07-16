const { handle } = require('../lib/messages')
const accounts = require('../lib/accounts')
const data = require('../lib/data')
const services = require('../lib/services')

jest.mock('../lib/accounts', () => ({
  registerAccount: jest.fn()
}))
jest.mock('../lib/data', () => ({
  read: jest.fn(),
  write: jest.fn()
}))
jest.mock('../lib/services', () => ({
  registerService: jest.fn(),
  loginResponse: jest.fn(),
  connectionResponse: jest.fn()
}))

describe('messages', () => {
  describe('#handle', () => {
    let res, next
    beforeEach(() => {
      res = jest.fn()
      next = jest.fn()
    })
    it('throws if handler is missing', async () => {
      await expect(handle({ payload: { type: 'FOO' }, res })).rejects.toThrow('Unknown type')
    })
    describe('ACCOUNT_REGISTRATION', () => {
      it('calls accounts.registerAccount', async () => {
        const header = {}
        const payload = { type: 'ACCOUNT_REGISTRATION' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res, next)
        expect(accounts.registerAccount).toHaveBeenCalledWith({ header, payload, token }, res, next)
      })
    })
    describe('DATA_READ_REQUEST', () => {
      it('calls data.read', async () => {
        const header = {}
        const payload = { type: 'DATA_READ_REQUEST' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res, next)
        expect(data.read).toHaveBeenCalledWith({ header, payload, token }, res, next)
      })
    })
    describe('DATA_WRITE', () => {
      it('calls data.write', async () => {
        const header = {}
        const payload = { type: 'DATA_WRITE' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res, next)
        expect(data.write).toHaveBeenCalledWith({ header, payload, token }, res, next)
      })
    })
    describe('LOGIN_RESPONSE', () => {
      it('calls services.loginResponse', async () => {
        const header = {}
        const payload = { type: 'LOGIN_RESPONSE' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res, next)
        expect(services.loginResponse).toHaveBeenCalledWith({ header, payload, token }, res, next)
      })
    })
    describe('CONNECTION_RESPONSE', () => {
      it('calls services.connectionResponse', async () => {
        const header = {}
        const payload = { type: 'CONNECTION_RESPONSE' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res, next)
        expect(services.connectionResponse).toHaveBeenCalledWith({ header, payload, token }, res, next)
      })
    })
    describe('SERVICE_REGISTRATION', () => {
      it('calls services.registerService', async () => {
        const header = {}
        const payload = { type: 'SERVICE_REGISTRATION' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res, next)
        expect(services.registerService).toHaveBeenCalledWith({ header, payload, token }, res, next)
      })
    })
  })
})
