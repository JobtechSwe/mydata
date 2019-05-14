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
  accountLogin: jest.fn(),
  accountConnect: jest.fn()
}))

describe('messages', () => {
  describe('#handle', () => {
    let res
    beforeEach(() => {

    })
    it('throws if handler is missing', async () => {
      await expect(handle({ payload: { type: 'FOO' }, res })).rejects.toThrow('Unknown type')
    })
    describe('ACCOUNT_REGISTRATION', () => {
      it('calls accounts.registerAccount', async () => {
        const header = {}
        const payload = { type: 'ACCOUNT_REGISTRATION' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res)
        expect(accounts.registerAccount).toHaveBeenCalledWith({ header, payload, token }, res)
      })
    })
    describe('DATA_READ', () => {
      it('calls data.read', async () => {
        const header = {}
        const payload = { type: 'DATA_READ' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res)
        expect(data.read).toHaveBeenCalledWith({ header, payload, token }, res)
      })
    })
    describe('DATA_WRITE', () => {
      it('calls data.write', async () => {
        const header = {}
        const payload = { type: 'DATA_WRITE' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res)
        expect(data.write).toHaveBeenCalledWith({ header, payload, token }, res)
      })
    })
    describe('LOGIN', () => {
      it('calls services.accountLogin', async () => {
        const header = {}
        const payload = { type: 'LOGIN' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res)
        expect(services.accountLogin).toHaveBeenCalledWith({ header, payload, token }, res)
      })
    })
    describe('CONNECTION', () => {
      it('calls services.accountConnect', async () => {
        const header = {}
        const payload = { type: 'CONNECTION' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res)
        expect(services.accountConnect).toHaveBeenCalledWith({ header, payload, token }, res)
      })
    })
    describe('SERVICE_REGISTRATION', () => {
      it('calls services.registerService', async () => {
        const header = {}
        const payload = { type: 'SERVICE_REGISTRATION' }
        const token = 'sdhsdjhfgsjhfg'
        await handle({ header, payload, token }, res)
        expect(services.registerService).toHaveBeenCalledWith({ header, payload, token }, res)
      })
    })
  })
})
